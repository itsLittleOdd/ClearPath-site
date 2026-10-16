#!/usr/bin/env node
/* Renders creative/brand/og-image.html (1200 x 630) to /og-image.png using
   isolated headless Chrome. No packages. Output is validated by
   tools/lib/output-paths.mjs: the default og-image.png, or a .png under
   qa/, dist/ or assets/media/. Nothing is deleted. Non-local requests are
   blocked before dispatch. Usage: node tools/render-brand.mjs [--out og-image.png] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchChrome } from './lib/chrome.mjs';
import { parseFlags, resolveOutput, ensureOutputDir, OutputPathError } from './lib/output-paths.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SOURCE = path.join(ROOT, 'creative/brand/og-image.html');

async function main() {
  const flags = parseFlags(process.argv.slice(2), { '--out': 'value' });
  const target = resolveOutput(ROOT, flags['--out'], 'brand');
  ensureOutputDir(target, 'brand');
  const chrome = await launchChrome();
  const allowedPrefix = pathToFileURL(ROOT).href + '/';
  const blocked = await chrome.restrictNetwork((u) => u.startsWith(allowedPrefix) || u === 'about:blank');
  try {
    await chrome.call('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
    const url = pathToFileURL(SOURCE).href;
    await chrome.navigate(url, { readyExpression: `location.href===${JSON.stringify(url)}&&document.readyState==='complete'&&[...document.images].every(x=>x.complete&&x.naturalWidth>0)` });
    const shot = await chrome.call('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false, clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
    fs.writeFileSync(target.absolute, Buffer.from(shot.data, 'base64'));
  } finally {
    await chrome.close();
  }
  if (blocked.length) { throw new Error('Brand composition attempted non-local requests (blocked before dispatch): ' + blocked.join(', ')); }
  console.log(JSON.stringify({ out: target.rel, bytes: fs.statSync(target.absolute).size, blockedRequests: blocked.length }));
}

main().catch((err) => { console.error((err instanceof OutputPathError ? 'REFUSED: ' : 'BRAND RENDER FAILED: ') + err.message); process.exit(err instanceof OutputPathError ? 2 : 1); });
