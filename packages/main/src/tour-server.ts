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

export function startTourServer(toursDir: string): http.Server {
  const resolvedBase = path.resolve(toursDir);

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
      if (statErr !== null || !stats.isFile()) {
        res.writeHead(404).end();
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME[ext] ?? 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });
  });

  server.listen(TOUR_SERVER_PORT, '127.0.0.1');
  return server;
}
