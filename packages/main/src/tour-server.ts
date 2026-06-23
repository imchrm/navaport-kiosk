import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export const TOUR_SERVER_PORT = 51440;
export const TOUR_SERVER_BASE_URL = `http://localhost:${TOUR_SERVER_PORT}/tours`;

const MIME: Record<string, string> = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript',
  '.mjs':   'application/javascript',
  '.json':  'application/json',
  '.css':   'text/css',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.svg':   'image/svg+xml',
  '.mp4':   'video/mp4',
  '.webp':  'image/webp',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
};

function serveFile(filePath: string, res: http.ServerResponse): void {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

// Serve static files rooted at serveDir.
// URL /tours/neoclassicalbedroom/ maps to <serveDir>/tours/neoclassicalbedroom/index.html.
// Pass process.resourcesPath as serveDir so the /tours/ URL prefix matches the
// tours/ subdirectory on disk without double-prefixing.
export function startTourServer(serveDir: string): http.Server {
  const resolvedBase = path.resolve(serveDir);

  const server = http.createServer((req, res) => {
    const rawUrl = req.url ?? '/';
    const urlPath = decodeURIComponent(rawUrl).split('?')[0] ?? '/';
    const normalized = path.posix.normalize(urlPath);
    const filePath = path.join(resolvedBase, normalized);

    if (!filePath.startsWith(resolvedBase + path.sep) && filePath !== resolvedBase) {
      res.writeHead(403).end();
      return;
    }

    fs.stat(filePath, (statErr, stats) => {
      if (statErr !== null) {
        res.writeHead(404).end();
        return;
      }

      if (stats.isDirectory()) {
        // No trailing slash → redirect so relative paths in index.html resolve correctly.
        if (!urlPath.endsWith('/')) {
          const qs = rawUrl.includes('?') ? rawUrl.slice(rawUrl.indexOf('?')) : '';
          res.writeHead(301, { Location: `${urlPath}/${qs}` }).end();
          return;
        }
        const indexPath = path.join(filePath, 'index.html');
        fs.stat(indexPath, (idxErr, idxStats) => {
          if (idxErr !== null || !idxStats.isFile()) {
            res.writeHead(404).end();
            return;
          }
          serveFile(indexPath, res);
        });
        return;
      }

      if (!stats.isFile()) {
        res.writeHead(404).end();
        return;
      }

      serveFile(filePath, res);
    });
  });

  server.listen(TOUR_SERVER_PORT, '127.0.0.1');
  return server;
}
