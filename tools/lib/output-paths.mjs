/* Output-path containment for every tool that writes files.
   Rules (all checked before any mutation):
   - Flags are parsed strictly: unknown flags, missing values and duplicate
     flags are rejected.
   - Requested paths must be relative and strict: no absolute paths, no "..",
     no "." segments, no empty segments (double or leading slash), no hidden
     segments. A single trailing slash is the only tolerated decoration.
   - The resolved path must sit under one of the purpose's allowed prefixes
     and never touch a protected prefix (source, inputs, repository data).
   - No symbolic link may appear in ANY existing path component below the
     root, dangling links included, and the nearest existing ancestor's
     realpath must stay inside the root's realpath.
   - Purposes with known output leaves (video) have each leaf checked: an
     existing leaf must be a regular file, never a link or a directory.
   - Nothing here deletes anything. Release builds fail closed when the
     destination already contains entries. */
import fs from 'node:fs';
import path from 'node:path';

export const PROTECTED_PREFIXES = [
  '.git', '.build-inputs', '.repair-inputs', '.claude', 'justin', 'tools', 'tests', 'creative', 'docs',
  'demos', 'services', 'work', 'pricing', 'contact', 'thank-you', 'privacy', 'terms',
  'assets/site.css', 'assets/site.js', 'assets/contact.js', 'assets/request-desk.js',
  'assets/business-brain.js', 'assets/website-manager.js', 'assets/home.js',
  'vercel.json', '.vercelignore', 'index.html', '404.html', 'robots.txt', 'sitemap.xml',
  'clearpath-logo.png', 'clearpath-logo.webp', 'justin-founder.webp', 'favicon.png',
  'README.md', 'BUILD-REPORT.md', 'DESIGN.md', 'LAUNCH-CHECKLIST.md'
];

export const VIDEO_LEAVES = ['request-demo.mp4', 'request-demo.webm', 'request-demo-poster.jpg', 'manifest.json'];

/* Where each purpose may write. Prefix "dir" means the path itself or any
   descendant; "file" means exactly that file. */
export const PURPOSES = {
  release: { kind: 'dir', allowed: ['dist'], defaultRel: 'dist', freshOnly: true },
  video: { kind: 'dir', allowed: ['assets/media', 'dist', 'qa'], defaultRel: 'assets/media', freshOnly: false, leaves: VIDEO_LEAVES },
  brand: { kind: 'file', allowed: ['og-image.png', 'dist', 'qa', 'assets/media'], defaultRel: 'og-image.png', freshOnly: false }
};

export class OutputPathError extends Error {}

export function parseFlags(argv, spec) {
  /* spec: { '--name': 'value' | 'boolean' } */
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!(token in spec)) { throw new OutputPathError('Unknown or malformed option: ' + token); }
    if (token in out) { throw new OutputPathError('Duplicate option: ' + token); }
    if (spec[token] === 'boolean') { out[token] = true; continue; }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) { throw new OutputPathError('Option needs a value: ' + token); }
    out[token] = value;
    i += 1;
  }
  return out;
}

function normalizeRel(requested) {
  if (typeof requested !== 'string' || requested.trim() === '') { throw new OutputPathError('Output path is empty'); }
  if (path.isAbsolute(requested) || /^[a-zA-Z]:[\\/]/.test(requested)) { throw new OutputPathError('Absolute output paths are not allowed: ' + requested); }
  if (requested.includes('\\') || requested.includes('\0')) { throw new OutputPathError('Invalid characters in output path'); }
  if (requested !== requested.trim()) { throw new OutputPathError('Output path has surrounding whitespace: ' + JSON.stringify(requested)); }
  if (requested === '.' || requested === './') { throw new OutputPathError('Output path resolves to the root itself'); }
  let s = requested;
  if (s.length > 1 && s.endsWith('/')) { s = s.slice(0, -1); }
  const segments = s.split('/');
  for (const seg of segments) {
    if (seg === '') { throw new OutputPathError('Empty path segment (leading or double slash) is not allowed: ' + requested); }
    if (seg === '.') { throw new OutputPathError('Current-directory segments are not allowed: ' + requested); }
    if (seg === '..') { throw new OutputPathError('Parent traversal is not allowed in output paths: ' + requested); }
    if (seg.startsWith('.')) { throw new OutputPathError('Hidden path segments are not allowed in output paths: ' + requested); }
  }
  return segments.join('/');
}

function underPrefix(rel, prefix) {
  return rel === prefix || rel.startsWith(prefix + '/');
}

function lstatOrNull(p) {
  try { return fs.lstatSync(p); } catch (err) { return null; }
}

/* Reject a symbolic link in any existing component between the root and the
   destination (the destination included), dangling links included, and make
   sure the nearest existing ancestor really lives inside the root. */
function assertNoSymlinkComponents(rootAbs, absolute) {
  const rootReal = fs.realpathSync(rootAbs);
  const rel = path.relative(rootAbs, absolute);
  let current = rootAbs;
  let deepestExisting = rootAbs;
  for (const seg of rel.split(path.sep)) {
    current = path.join(current, seg);
    const st = lstatOrNull(current);
    if (!st) { break; }
    if (st.isSymbolicLink()) { throw new OutputPathError('Symbolic link in output path; refusing: ' + path.relative(rootAbs, current)); }
    deepestExisting = current;
  }
  const real = fs.realpathSync(deepestExisting);
  if (real !== rootReal && !real.startsWith(rootReal + path.sep)) {
    throw new OutputPathError('Destination escapes the root through a symlink: ' + absolute);
  }
}

/* Validate and return { rel, absolute } for an output location. Creates
   nothing and deletes nothing. */
export function resolveOutput(root, requested, purposeName) {
  const purpose = PURPOSES[purposeName];
  if (!purpose) { throw new OutputPathError('Unknown output purpose: ' + purposeName); }
  const rel = normalizeRel(requested === undefined ? purpose.defaultRel : requested);
  const rootAbs = path.resolve(root);
  const absolute = path.resolve(rootAbs, rel);
  if (absolute === rootAbs || !absolute.startsWith(rootAbs + path.sep)) { throw new OutputPathError('Output must stay inside the root: ' + requested); }
  for (const prot of PROTECTED_PREFIXES) {
    if (underPrefix(rel, prot) || underPrefix(prot, rel)) { throw new OutputPathError('Output overlaps a protected or source path: ' + rel); }
  }
  if (!purpose.allowed.some((a) => underPrefix(rel, a))) {
    throw new OutputPathError('Output for ' + purposeName + ' must be under ' + purpose.allowed.join(' or ') + ', got: ' + rel);
  }
  if (purpose.kind === 'file' && rel !== purpose.defaultRel && !/\.png$/.test(rel)) {
    throw new OutputPathError('Brand output must be a .png file: ' + rel);
  }
  assertNoSymlinkComponents(rootAbs, absolute);
  const st = lstatOrNull(absolute);
  if (purpose.kind === 'dir' && st && !st.isDirectory()) {
    throw new OutputPathError('Output path exists and is not a directory: ' + rel);
  }
  if (purpose.kind === 'file' && st && !st.isFile()) {
    throw new OutputPathError('Output path exists and is not a regular file: ' + rel);
  }
  if (purpose.leaves) {
    for (const leaf of purpose.leaves) {
      const leafStat = lstatOrNull(path.join(absolute, leaf));
      if (!leafStat) { continue; }
      if (leafStat.isSymbolicLink()) { throw new OutputPathError('Output leaf is a symbolic link; refusing: ' + rel + '/' + leaf); }
      if (!leafStat.isFile()) { throw new OutputPathError('Output leaf exists and is not a regular file: ' + rel + '/' + leaf); }
    }
  }
  if (purpose.freshOnly && st && fs.readdirSync(absolute).length > 0) {
    throw new OutputPathError('Destination already contains files; choose a fresh name under dist/ (nothing is deleted): ' + rel);
  }
  return { rel, absolute };
}

/* Create the directory for a validated output (no deletion). */
export function ensureOutputDir(validated, purposeName) {
  const purpose = PURPOSES[purposeName];
  const dir = purpose.kind === 'file' ? path.dirname(validated.absolute) : validated.absolute;
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/* Scratch directories are only ever removed when they were created by us
   under the OS temp directory with our prefix. */
export function isOwnedScratch(dir, prefix, tmpBase) {
  let real;
  try { real = fs.realpathSync(dir); } catch (err) { return false; }
  const tmpReal = fs.realpathSync(tmpBase);
  return real.startsWith(tmpReal + path.sep) && path.basename(real).startsWith(prefix);
}
