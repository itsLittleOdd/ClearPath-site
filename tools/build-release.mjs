#!/usr/bin/env node
/* Builds a release candidate folder from the public allowlist.
   Safety contract (see tools/lib/output-paths.mjs):
   - Output is only ever `dist` or a fresh folder under `dist/`.
   - Nothing is deleted. If the destination already contains entries the
     build fails closed; pick a new name (for example dist/2026-10-16-b).
   - Unknown flags, absolute paths, traversal, hidden segments, protected or
     source overlap and symlink escapes are rejected before any write.
   It copies files; it never uploads, deploys, commits or touches hosting
   configuration. Release remains a separate, held decision.
   Usage: node tools/build-release.mjs [--check] [--out dist/<fresh-name>] */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PUBLIC_FILES, PUBLIC_MEDIA } from './public-allowlist.mjs';
import { parseFlags, resolveOutput, ensureOutputDir, OutputPathError } from './lib/output-paths.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CANDIDATE_ROOT = path.resolve(HERE, '..');

export function buildRelease({ root = CANDIDATE_ROOT, outRel, checkOnly = false, files = [...PUBLIC_FILES], pendingOk = PUBLIC_MEDIA } = {}) {
  const manifest = { builtAt: new Date().toISOString(), note: 'Local release candidate. Not deployed.', files: [], missing: [] };
  const target = checkOnly ? null : resolveOutput(root, outRel, 'release');
  for (const rel of [...files].sort()) {
    const src = path.join(root, rel);
    if (!fs.existsSync(src)) {
      manifest.missing.push({ file: rel, pending: pendingOk.includes(rel) ? 'parent render pending' : 'missing' });
      continue;
    }
    const bytes = fs.statSync(src).size;
    const sha256 = crypto.createHash('sha256').update(fs.readFileSync(src)).digest('hex');
    manifest.files.push({ file: rel, bytes, sha256 });
  }
  if (target) {
    ensureOutputDir(target, 'release');
    for (const entry of manifest.files) {
      const dest = path.join(target.absolute, entry.file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(root, entry.file), dest, fs.constants.COPYFILE_EXCL);
    }
    fs.writeFileSync(path.join(target.absolute, 'RELEASE-MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  }
  return { mode: checkOnly ? 'check' : 'build', out: target ? target.rel : null, files: manifest.files.length, missing: manifest.missing };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const flags = parseFlags(process.argv.slice(2), { '--check': 'boolean', '--out': 'value' });
    const result = buildRelease({ outRel: flags['--out'], checkOnly: Boolean(flags['--check']) });
    console.log(JSON.stringify(result, null, 2));
    console.log('Nothing was deployed or deleted. Release is a separate decision.');
  } catch (err) {
    console.error((err instanceof OutputPathError ? 'REFUSED: ' : 'BUILD FAILED: ') + err.message);
    process.exit(2);
  }
}
