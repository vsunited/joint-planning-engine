#!/usr/bin/env node
/**
 * Serves the exported site the way Firebase Hosting does.
 *
 * Two reasons this exists rather than reaching for a one-line static server.
 *
 * The trial protocol requires running against a production build: React
 * re-invokes mount effects in development, which inflates the telemetry event
 * counts, and the auth gate is bypassed in development entirely. Measuring
 * against `next dev` would measure a different application.
 *
 * And hosting is configured with `cleanUrls`, so `/trial` is served from
 * `trial.html`. A plain static server 404s on that path, which would make a
 * correctly configured deployment look broken locally. This mirrors the rule
 * instead.
 *
 * No dependencies, so it runs on an air-gapped machine.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'apps', 'web', 'out');
const PORT = Number(process.env.PORT || 4000);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/** Resolves a request path the way `cleanUrls: true` does. */
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const candidates =
    clean === '' || clean.endsWith('/')
      ? [path.join(clean, 'index.html')]
      : [clean, `${clean}.html`, path.join(clean, 'index.html')];

  for (const c of candidates) {
    const full = path.join(ROOT, c);
    // Never serve outside the export directory.
    if (!full.startsWith(ROOT)) continue;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

if (!fs.existsSync(ROOT)) {
  console.error(`No export at ${ROOT}. Run: pnpm --filter @jpe/web build`);
  process.exit(1);
}

http
  .createServer((req, res) => {
    const file = resolveFile(req.url || '/');
    if (!file) {
      const notFound = path.join(ROOT, '404.html');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`Serving production export on http://localhost:${PORT}`));
