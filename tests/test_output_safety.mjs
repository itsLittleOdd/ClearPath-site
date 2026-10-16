/* Negative tests for output-path containment. Every case runs against a
   disposable fixture tree under the OS temp directory that imitates the
   candidate layout (sentinel bytes in .git, justin, assets, index.html).
   The real candidate is never used as a destination.
   Run: node --test tests/test_output_safety.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseFlags, resolveOutput, OutputPathError, isOwnedScratch } from '../tools/lib/output-paths.mjs';
import { buildRelease } from '../tools/build-release.mjs';

const SENTINELS = {
  '.git/config': '[core]\n\tsentinel = true\n',
  '.git/HEAD': 'ref: refs/heads/sentinel\n',
  '.build-inputs/BRIEF.md': 'frozen brief sentinel\n',
  'justin/card.html': '<!doctype html><title>card sentinel</title>\n',
  'justin/justin-whalen.vcf': 'BEGIN:VCARD\nEND:VCARD\n',
  'assets/site.css': 'body{content:"sentinel"}\n',
  'assets/site.js': '/* sentinel */\n',
  'assets/media/old.mp4': 'not really video\n',
  'index.html': '<!doctype html><title>home sentinel</title>\n',
  'vercel.json': '{"sentinel":true}\n',
  'og-image.png': 'PNG sentinel\n',
  'docs/notes.md': 'docs sentinel\n'
};

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'clearpath-output-fixture-'));
  for (const [rel, body] of Object.entries(SENTINELS)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), body);
  }
  return root;
}

function snapshot(root) {
  const out = {};
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) { out[path.relative(root, full)] = 'symlink:' + fs.readlinkSync(full); continue; }
      if (entry.isDirectory()) { walk(full); continue; }
      out[path.relative(root, full)] = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
    }
  };
  walk(root);
  return out;
}

function expectRefusal(fn, pattern) {
  assert.throws(fn, (err) => err instanceof OutputPathError && pattern.test(err.message), 'expected refusal matching ' + pattern);
}

test('release output refuses protected, source, traversal, absolute and hidden destinations without touching bytes', (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const before = snapshot(root);
  /* Patterns match the refusal class, case-insensitively, not exact wording. */
  const cases = [
    ['justin', /protected|source/i],
    ['.git', /hidden|protected/i],
    ['assets', /protected|source/i],
    ['assets/media', /must be under dist/i],
    ['docs', /protected|source/i],
    ['.', /root itself/i],
    ['', /empty/i],
    ['/tmp/anywhere', /absolute/i],
    [root, /absolute/i],
    ['../escape', /traversal/i],
    ['dist/../justin', /traversal|current-directory/i],
    ['dist/./../.git', /traversal|current-directory/i],
    ['dist/.hidden', /hidden/i],
    ['index.html', /protected|source|must be under dist/i],
    ['og-image.png', /protected|source|must be under dist/i],
    ['dist//x', /empty path segment/i],
    ['/dist', /absolute/i],
    ['./dist/x', /current-directory/i],
    ['dist/./x', /current-directory/i],
    [' dist/x', /whitespace|absolute|empty/i]
  ];
  for (const [requested, pattern] of cases) {
    expectRefusal(() => resolveOutput(root, requested, 'release'), pattern);
    expectRefusal(() => buildRelease({ root, outRel: requested, files: ['index.html'] }), pattern);
  }
  assert.equal(resolveOutput(root, 'dist/x/', 'release').rel, 'dist/x', 'a single trailing slash is tolerated');
  assert.deepEqual(snapshot(root), before, 'fixture bytes changed after refusals');
});

test('symlinks anywhere in the output path, dangling links and linked output leaves are refused', (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'qa'));
  /* qa/inside -> <root>/justin : realpath stays inside root, must still be refused */
  fs.symlinkSync(path.join(root, 'justin'), path.join(root, 'qa', 'inside'));
  /* qa/dangling -> nowhere */
  fs.symlinkSync(path.join(root, 'qa', 'does-not-exist'), path.join(root, 'qa', 'dangling'));
  /* assets/media/request-demo.mp4 -> <root>/justin/card.html : linked output leaf */
  fs.symlinkSync(path.join(root, 'justin', 'card.html'), path.join(root, 'assets', 'media', 'request-demo.mp4'));
  /* dist -> <root>/assets : release destination link that stays inside root */
  fs.symlinkSync(path.join(root, 'assets'), path.join(root, 'dist'));
  const before = snapshot(root);
  expectRefusal(() => resolveOutput(root, 'qa/inside/new.png', 'brand'), /symbolic link/i);
  expectRefusal(() => resolveOutput(root, 'qa/inside', 'video'), /symbolic link/i);
  expectRefusal(() => resolveOutput(root, 'qa/inside/deeper', 'video'), /symbolic link/i);
  expectRefusal(() => resolveOutput(root, 'qa/dangling/x.png', 'brand'), /symbolic link/i);
  expectRefusal(() => resolveOutput(root, 'qa/dangling', 'video'), /symbolic link/i);
  expectRefusal(() => resolveOutput(root, 'assets/media', 'video'), /leaf is a symbolic link/i);
  expectRefusal(() => resolveOutput(root, 'dist', 'release'), /symbolic link/i);
  expectRefusal(() => resolveOutput(root, 'dist/fresh', 'release'), /symbolic link/i);
  expectRefusal(() => buildRelease({ root, outRel: 'dist/fresh', files: ['index.html'] }), /symbolic link/i);
  assert.equal(fs.readFileSync(path.join(root, 'justin', 'card.html'), 'utf8'), SENTINELS['justin/card.html']);
  assert.deepEqual(snapshot(root), before, 'fixture bytes changed after symlink refusals');
  /* the ordinary destinations keep working once no link is involved */
  fs.unlinkSync(path.join(root, 'assets', 'media', 'request-demo.mp4'));
  fs.writeFileSync(path.join(root, 'assets', 'media', 'request-demo.mp4'), 'regular file\n');
  assert.equal(resolveOutput(root, 'assets/media', 'video').rel, 'assets/media');
  fs.mkdirSync(path.join(root, 'assets', 'media', 'manifest.json'));
  expectRefusal(() => resolveOutput(root, 'assets/media', 'video'), /leaf exists and is not a regular file/i);
});

test('release output refuses symlink escapes and non-empty destinations, never deleting', (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'clearpath-outside-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.writeFileSync(path.join(outside, 'keep.txt'), 'outside sentinel\n');
  fs.symlinkSync(outside, path.join(root, 'dist'));
  const before = snapshot(root);
  expectRefusal(() => resolveOutput(root, 'dist', 'release'), /symbolic link|symlink/i);
  expectRefusal(() => resolveOutput(root, 'dist/sub', 'release'), /symbolic link|symlink/i);
  assert.equal(fs.readFileSync(path.join(outside, 'keep.txt'), 'utf8'), 'outside sentinel\n');
  fs.unlinkSync(path.join(root, 'dist'));
  fs.mkdirSync(path.join(root, 'dist'));
  fs.writeFileSync(path.join(root, 'dist', 'previous.txt'), 'previous build\n');
  expectRefusal(() => buildRelease({ root, outRel: 'dist', files: ['index.html'] }), /already contains/);
  assert.equal(fs.readFileSync(path.join(root, 'dist', 'previous.txt'), 'utf8'), 'previous build\n');
  delete before.dist;
  const after = snapshot(root);
  assert.equal(after['dist/previous.txt'], crypto.createHash('sha256').update('previous build\n').digest('hex'));
  for (const key of Object.keys(before)) { assert.equal(after[key], before[key], key); }
});

test('a fresh dist folder builds, and a second build into it is refused', (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const before = snapshot(root);
  const files = ['index.html', 'assets/site.css', 'assets/media/pending.mp4'];
  const result = buildRelease({ root, outRel: 'dist/2026-10-16-a', files, pendingOk: ['assets/media/pending.mp4'] });
  assert.equal(result.out, 'dist/2026-10-16-a');
  assert.equal(result.files, 2);
  assert.deepEqual(result.missing, [{ file: 'assets/media/pending.mp4', pending: 'parent render pending' }]);
  assert.equal(fs.readFileSync(path.join(root, 'dist/2026-10-16-a/index.html'), 'utf8'), SENTINELS['index.html']);
  assert.ok(fs.existsSync(path.join(root, 'dist/2026-10-16-a/RELEASE-MANIFEST.json')));
  expectRefusal(() => buildRelease({ root, outRel: 'dist/2026-10-16-a', files }), /already contains/);
  const after = snapshot(root);
  for (const key of Object.keys(before)) { assert.equal(after[key], before[key], key); }
  const check = buildRelease({ root, checkOnly: true, files });
  assert.equal(check.mode, 'check');
  assert.equal(check.out, null);
});

test('renderer outputs are bounded to their documented destinations', (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const before = snapshot(root);
  assert.equal(resolveOutput(root, undefined, 'video').rel, 'assets/media');
  assert.equal(resolveOutput(root, 'assets/media', 'video').rel, 'assets/media');
  assert.equal(resolveOutput(root, 'qa/render-test', 'video').rel, 'qa/render-test');
  for (const bad of ['assets', 'assets/site.js', 'justin', '.git', '../x', '/tmp/x', 'creative', 'tools/lib']) {
    expectRefusal(() => resolveOutput(root, bad, 'video'), /./);
  }
  assert.equal(resolveOutput(root, undefined, 'brand').rel, 'og-image.png');
  assert.equal(resolveOutput(root, 'qa/og-candidate.png', 'brand').rel, 'qa/og-candidate.png');
  for (const bad of ['favicon.png', 'justin/card.html', 'index.html', 'qa/notes.txt', 'assets/site.css', '../og.png', '/tmp/og.png']) {
    expectRefusal(() => resolveOutput(root, bad, 'brand'), /./);
  }
  assert.deepEqual(snapshot(root), before);
});

test('flag parsing rejects unknown, duplicate and valueless options', () => {
  const spec = { '--check': 'boolean', '--out': 'value' };
  assert.deepEqual(parseFlags(['--check', '--out', 'dist/x'], spec), { '--check': true, '--out': 'dist/x' });
  for (const argv of [['--outt', 'x'], ['--out'], ['--out', '--check'], ['--out', 'a', '--out', 'b'], ['dist'], ['-o', 'x'], ['--rm']]) {
    assert.throws(() => parseFlags(argv, spec), OutputPathError, JSON.stringify(argv));
  }
});

test('scratch-directory ownership check only accepts our own temp folders', (t) => {
  const owned = fs.mkdtempSync(path.join(os.tmpdir(), 'clearpath-frames-'));
  t.after(() => fs.rmSync(owned, { recursive: true, force: true }));
  const other = fs.mkdtempSync(path.join(os.tmpdir(), 'someone-else-'));
  t.after(() => fs.rmSync(other, { recursive: true, force: true }));
  assert.equal(isOwnedScratch(owned, 'clearpath-frames-', os.tmpdir()), true);
  assert.equal(isOwnedScratch(other, 'clearpath-frames-', os.tmpdir()), false);
  assert.equal(isOwnedScratch(path.resolve('.'), 'clearpath-frames-', os.tmpdir()), false);
  assert.equal(isOwnedScratch('/definitely/missing/path', 'clearpath-frames-', os.tmpdir()), false);
});
