#!/usr/bin/env node
/* Loopback review server for the ClearPath candidate.
   - Binds 127.0.0.1 only.
   - Serves only files in tools/public-allowlist.mjs; everything else is a
     404 rendered with the site's own 404.html and a real 404 status.
     .git, .build-inputs, tests, tools, creative, docs, reports and every
     Markdown file are therefore unreachable.
   - Mirrors the vercel.json redirects (/about, /justin) with 308s.
   - Supports HEAD and single-range GET (video scrubbing), no caching, nosniff.
   Usage: node tools/serve.mjs [--port 4173] [--host 127.0.0.1]
   Importable: createReviewServer({ root, host, port }) for tests. */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveRequest, CONTENT_TYPES } from './public-allowlist.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CANDIDATE_ROOT = path.resolve(HERE, '..');

function baseHeaders(type) {
  return {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

export function createReviewServer({ root = CANDIDATE_ROOT } = {}) {
  const notFoundPage = path.join(root, '404.html');

  function send404(req, res) {
    let body = '<!DOCTYPE html><title>Not found</title><h1>404 Not found</h1>';
    try { body = fs.readFileSync(notFoundPage, 'utf8'); } catch (err) { /* fallback body above */ }
    const buf = Buffer.from(body);
    res.writeHead(404, { ...baseHeaders('text/html; charset=utf-8'), 'Content-Length': buf.length });
    if (req.method === 'HEAD') { res.end(); } else { res.end(buf); }
  }

  return http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...baseHeaders('text/plain; charset=utf-8'), Allow: 'GET, HEAD' });
      res.end('Method not allowed. This review server serves static files only; nothing is accepted.');
      return;
    }
    const decision = resolveRequest(req.url || '/');
    if (decision.kind === 'redirect') {
      res.writeHead(decision.status, { ...baseHeaders('text/plain; charset=utf-8'), Location: decision.location });
      res.end();
      return;
    }
    if (decision.kind !== 'file') { send404(req, res); return; }
    const file = path.join(root, decision.file);
    let stat;
    try { stat = fs.statSync(file); } catch (err) { send404(req, res); return; }
    if (!stat.isFile()) { send404(req, res); return; }
    const type = CONTENT_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const headers = { ...baseHeaders(type), 'Accept-Ranges': 'bytes' };

    const range = req.headers.range;
    if (range && /^bytes=\d*-\d*$/.test(range)) {
      const [startStr, endStr] = range.replace('bytes=', '').split('-');
      let start = startStr ? Number(startStr) : 0;
      let end = endStr ? Number(endStr) : stat.size - 1;
      if (!startStr && endStr) { start = Math.max(0, stat.size - Number(endStr)); end = stat.size - 1; }
      if (start > end || end >= stat.size) {
        res.writeHead(416, { ...headers, 'Content-Range': `bytes */${stat.size}` });
        res.end();
        return;
      }
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 });
      if (req.method === 'HEAD') { res.end(); return; }
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { ...headers, 'Content-Length': stat.size });
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res);
  });
}

export function startReviewServer({ host = '127.0.0.1', port = 4173, root = CANDIDATE_ROOT } = {}) {
  return new Promise((resolve, reject) => {
    const server = createReviewServer({ root });
    server.once('error', reject);
    server.listen(port, host, () => {
      const address = server.address();
      resolve({ server, url: `http://${host}:${address.port}`, port: address.port, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const get = (flag, fallback) => { const i = args.indexOf(flag); return i !== -1 && args[i + 1] ? args[i + 1] : fallback; };
  const host = get('--host', '127.0.0.1');
  const port = Number(get('--port', '4173'));
  if (host !== '127.0.0.1' && host !== 'localhost' && host !== '::1') {
    console.error('Refusing to bind a non-loopback host. This is a local review server.');
    process.exit(2);
  }
  startReviewServer({ host, port }).then(({ url }) => {
    console.log(`ClearPath review server: ${url}/  (root: ${CANDIDATE_ROOT})`);
    console.log('Serving the public allowlist only. Press Ctrl+C to stop.');
  }).catch((err) => { console.error(err.message); process.exit(1); });
}
