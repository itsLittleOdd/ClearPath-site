/* The single source of truth for what the local server may serve and what a
   future release bundle may contain. Anything not listed here is invisible
   to the loopback server (404) and excluded by tools/build-release.mjs.
   Paths are relative to the candidate root, forward slashes, no leading /. */

export const PUBLIC_PAGES = [
  'index.html',
  'services/index.html',
  'work/index.html',
  'pricing/index.html',
  'exit-readiness/index.html',
  'contact/index.html',
  'thank-you/index.html',
  'privacy/index.html',
  'terms/index.html',
  'demos/index.html',
  'demos/request-desk/index.html',
  'demos/business-brain/index.html',
  'demos/website-manager/index.html',
  '404.html',
  'justin/card.html'
];

export const PUBLIC_ASSETS = [
  'robots.txt',
  'exit-readiness/clearpath-exit-readiness-checklist.pdf',
  'sitemap.xml',
  'favicon.png',
  'og-image.png',
  'clearpath-logo.png',
  'clearpath-logo.webp',
  'justin-founder.webp',
  'justin/justin-portrait.webp',
  'justin/justin-whalen.vcf',
  'assets/site.css',
  'assets/site.js',
  'assets/contact.js',
  'assets/request-desk.js',
  'assets/business-brain.js',
  'assets/website-manager.js'
];

/* Parent-rendered binaries. Listed so the server can serve them once they
   exist; missing files simply 404 until tools/render-video.mjs has run. */
export const PUBLIC_MEDIA = [
  'assets/media/request-demo.mp4',
  'assets/media/request-demo.webm',
  'assets/media/request-demo-poster.jpg'
];

export const PUBLIC_FILES = new Set([...PUBLIC_PAGES, ...PUBLIC_ASSETS, ...PUBLIC_MEDIA]);

/* Files whose bytes must equal the baseline commit (checked by tests). */
export const PINNED_FILES = [
  'justin/card.html',
  'justin/justin-portrait.webp',
  'justin/justin-whalen.vcf',
  'vercel.json',
  '.vercelignore'
];

/* Route-level redirects mirrored from vercel.json for local parity. */
export const REDIRECTS = [
  { source: '/about', destination: '/#about', status: 308 },
  { source: '/about/', destination: '/#about', status: 308 },
  { source: '/justin', destination: '/justin/card.html', status: 308 },
  { source: '/justin/', destination: '/justin/card.html', status: 308 }
];

export const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.vcf': 'text/vcard; charset=utf-8'
};

/* Resolve a request path to a decision:
   { kind: 'file', file }             serve this allowlisted file
   { kind: 'redirect', location, status }
   { kind: 'notfound' }
   The caller is responsible for 404-ing allowlisted files that do not exist
   on disk yet (pending media). */
export function resolveRequest(rawPath) {
  let p;
  try { p = decodeURIComponent(rawPath.split('?')[0].split('#')[0]); } catch (err) { return { kind: 'notfound' }; }
  if (!p.startsWith('/') || p.includes('\0') || p.includes('..') || p.includes('\\')) { return { kind: 'notfound' }; }
  for (const r of REDIRECTS) {
    if (p === r.source) { return { kind: 'redirect', location: r.destination, status: r.status }; }
  }
  if (p.split('/').some((seg) => seg.startsWith('.') && seg.length > 0)) { return { kind: 'notfound' }; }
  let rel = p.slice(1);
  if (rel === '' || rel.endsWith('/')) { rel += 'index.html'; }
  if (PUBLIC_FILES.has(rel)) { return { kind: 'file', file: rel }; }
  if (PUBLIC_FILES.has(rel + '/index.html')) { return { kind: 'redirect', location: p + '/', status: 308 }; }
  return { kind: 'notfound' };
}
