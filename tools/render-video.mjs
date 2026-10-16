#!/usr/bin/env node
/* Renders creative/request-demo/composition.html to MP4 (and WebM when the
   local FFmpeg has libvpx-vp9), plus a JPEG poster and a manifest.
   Zero new packages: isolated headless Chrome over CDP for frame capture,
   FFmpeg for encoding. Deterministic: every frame is window.__seek(t).
   Safety: output is validated by tools/lib/output-paths.mjs (default
   assets/media, or a folder under dist/ or qa/); nothing is deleted except
   our own frame scratch folder under the OS temp directory; every browser
   request outside the candidate's file:// tree is blocked before dispatch.

   Usage: node tools/render-video.mjs [--fps 24] [--out assets/media]
          [--skip-webm] [--keep-frames] [--ffmpeg /path/to/ffmpeg]
   Environment: CLEARPATH_FFMPEG, CLEARPATH_FFPROBE, CLEARPATH_CHROME. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchChrome } from './lib/chrome.mjs';
import { parseFlags, resolveOutput, ensureOutputDir, isOwnedScratch, OutputPathError } from './lib/output-paths.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
let flags;
try {
  flags = parseFlags(process.argv.slice(2), { '--fps': 'value', '--out': 'value', '--skip-webm': 'boolean', '--keep-frames': 'boolean', '--ffmpeg': 'value' });
} catch (err) { console.error('REFUSED: ' + err.message); process.exit(2); }

const FPS = Number(flags['--fps'] || '24');
if (!Number.isInteger(FPS) || FPS < 12 || FPS > 60) { console.error('REFUSED: --fps must be an integer between 12 and 60'); process.exit(2); }
const COMPOSITION = path.join(ROOT, 'creative/request-demo/composition.html');
const FFMPEG = flags['--ffmpeg'] || process.env.CLEARPATH_FFMPEG || firstExisting(['/Users/Hermes/.local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg']) || 'ffmpeg';
const FFPROBE = process.env.CLEARPATH_FFPROBE || firstExisting(['/Users/Hermes/.local/bin/ffprobe', '/opt/homebrew/bin/ffprobe', '/usr/local/bin/ffprobe']) || 'ffprobe';

function firstExisting(list) { return list.find((p) => fs.existsSync(p)); }
function run(cmd, cmdArgs, { allowFail = false } = {}) {
  const r = spawnSync(cmd, cmdArgs, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !allowFail) {
    throw new Error(`${cmd} ${cmdArgs.join(' ')} failed (${r.status}):\n${(r.stderr || '').slice(-2000)}`);
  }
  return r;
}
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function probe(file) {
  const r = run(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,width,height,nb_frames,r_frame_rate', '-of', 'json', file], { allowFail: true });
  try { return JSON.parse(r.stdout); } catch (err) { return { error: 'ffprobe unavailable or failed', stderr: (r.stderr || '').slice(-400) }; }
}

async function main() {
  const target = resolveOutput(ROOT, flags['--out'], 'video');
  const OUT_DIR = target.absolute;
  if (!fs.existsSync(COMPOSITION)) { throw new Error('Composition missing: ' + COMPOSITION); }
  const ffmpegCheck = run(FFMPEG, ['-hide_banner', '-version'], { allowFail: true });
  if (ffmpegCheck.status !== 0) { throw new Error('FFmpeg not runnable at ' + FFMPEG + '. Pass --ffmpeg or set CLEARPATH_FFMPEG.'); }
  const encoders = run(FFMPEG, ['-hide_banner', '-encoders'], { allowFail: true }).stdout || '';
  const hasX264 = /\blibx264\b/.test(encoders);
  const hasVp9 = /\blibvpx-vp9\b/.test(encoders);
  if (!hasX264) { throw new Error('This FFmpeg has no libx264 encoder; MP4 cannot be produced.'); }

  ensureOutputDir(target, 'video');
  const framesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clearpath-frames-'));
  const chrome = await launchChrome();
  const allowedPrefix = pathToFileURL(ROOT).href + '/';
  const blocked = await chrome.restrictNetwork((u) => u.startsWith(allowedPrefix) || u === 'about:blank');
  const pageErrors = [];
  chrome.on('Runtime.exceptionThrown', (p) => pageErrors.push(p.exceptionDetails.text));

  let composition;
  let frameCount = 0;
  try {
    await chrome.call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
    await chrome.call('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    const url = pathToFileURL(COMPOSITION).href;
    await chrome.navigate(url, { readyExpression: `location.href===${JSON.stringify(url)}&&document.readyState==='complete'&&!!window.__composition&&[...document.images].every(x=>x.complete&&x.naturalWidth>0)` });
    composition = await chrome.evalJS('window.__composition');
    if (composition.width !== 1280 || composition.height !== 720) { throw new Error('Composition size mismatch'); }
    const duration = composition.duration;
    if (!(duration >= 15 && duration <= 25)) { throw new Error('Composition duration out of the 15 to 25 second range: ' + duration); }
    frameCount = Math.round(duration * FPS);
    console.log(`Rendering ${frameCount} frames at ${FPS} fps (${duration} s) from ${path.relative(ROOT, COMPOSITION)} into ${target.rel}`);

    for (let i = 0; i < frameCount; i += 1) {
      const t = i / FPS;
      await chrome.evalJS(`window.__seek(${t})`);
      const shot = await chrome.call('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
      fs.writeFileSync(path.join(framesDir, String(i).padStart(5, '0') + '.png'), Buffer.from(shot.data, 'base64'));
      if (i % FPS === 0) { process.stdout.write(`  ${t.toFixed(0)} s\n`); }
    }
    /* poster frame rendered separately at the exact poster time */
    await chrome.evalJS(`window.__seek(${composition.posterTime})`);
    const posterShot = await chrome.call('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    fs.writeFileSync(path.join(framesDir, 'poster.png'), Buffer.from(posterShot.data, 'base64'));
  } finally {
    await chrome.close();
  }
  if (blocked.length) { throw new Error('Composition attempted non-local requests (blocked before dispatch): ' + blocked.join(', ')); }
  if (pageErrors.length) { throw new Error('Composition runtime errors: ' + pageErrors.join('; ')); }

  const mp4 = path.join(OUT_DIR, 'request-demo.mp4');
  const webm = path.join(OUT_DIR, 'request-demo.webm');
  const poster = path.join(OUT_DIR, 'request-demo-poster.jpg');
  const pattern = path.join(framesDir, '%05d.png');

  console.log('Encoding MP4 (libx264, yuv420p, faststart)');
  run(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS), '-i', pattern,
    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p', '-crf', '26', '-preset', 'slow',
    '-movflags', '+faststart', '-an', mp4]);

  let webmStatus = 'skipped';
  if (!flags['--skip-webm']) {
    if (hasVp9) {
      console.log('Encoding WebM (libvpx-vp9)');
      const r = run(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS), '-i', pattern,
        '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-an', webm], { allowFail: true });
      webmStatus = r.status === 0 ? 'rendered' : 'failed: ' + (r.stderr || '').slice(-300);
    } else {
      webmStatus = 'skipped: libvpx-vp9 encoder not present in this FFmpeg';
    }
  }

  console.log('Writing poster (JPEG, 960 px wide)');
  run(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(framesDir, 'poster.png'),
    '-vf', 'scale=960:-2', '-q:v', '5', '-pix_fmt', 'yuvj420p', poster]);

  const manifest = {
    composition: path.relative(ROOT, COMPOSITION),
    compositionSha256: sha256(COMPOSITION),
    name: composition.name,
    durationSeconds: composition.duration,
    fps: FPS,
    frames: frameCount,
    posterTimeSeconds: composition.posterTime,
    textEquivalent: composition.textEquivalent,
    externalRequests: 0,
    blockedRequests: blocked.length,
    outputs: {}
  };
  for (const [key, file] of Object.entries({ mp4, webm, poster })) {
    if (fs.existsSync(file)) {
      manifest.outputs[key] = { file: path.relative(ROOT, file), bytes: fs.statSync(file).size, sha256: sha256(file), probe: key === 'poster' ? undefined : probe(file) };
    }
  }
  manifest.webm = webmStatus;
  manifest.renderedWith = { ffmpeg: FFMPEG, node: process.version, chrome: 'headless, isolated profile, non-local requests blocked' };
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  if (flags['--keep-frames']) {
    console.log('Frames kept at ' + framesDir);
  } else if (isOwnedScratch(framesDir, 'clearpath-frames-', os.tmpdir())) {
    fs.rmSync(framesDir, { recursive: true, force: true });
  } else {
    console.log('Frame folder not recognized as our own scratch; left in place: ' + framesDir);
  }
  console.log(JSON.stringify({ out: target.rel, mp4: manifest.outputs.mp4 && manifest.outputs.mp4.bytes, webm: webmStatus, poster: manifest.outputs.poster && manifest.outputs.poster.bytes, manifest: path.relative(ROOT, path.join(OUT_DIR, 'manifest.json')) }));
}

main().catch((err) => { console.error((err instanceof OutputPathError ? 'REFUSED: ' : 'RENDER FAILED: ') + err.message); process.exit(err instanceof OutputPathError ? 2 : 1); });
