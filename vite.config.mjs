import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

const MEDIA_EXAMS = path.resolve('media/exams');
const MIME = { '.mp3': 'audio/mpeg', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json' };

// Exam audio/images (~2 GB) live in media/exams instead of public/ so `vite build` does not copy them into dist/.
// In dev they are served at /exams/* (with Range support for audio seeking); Electron maps /exams/* itself.
function serveExamMedia() {
  const handler = (req, res, next) => {
    const url = decodeURIComponent((req.url || '').split('?')[0]);
    if (!url.startsWith('/exams/')) return next();
    const file = path.join(MEDIA_EXAMS, url.slice('/exams/'.length));
    if (!file.startsWith(MEDIA_EXAMS) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
    const size = fs.statSync(file).size;
    res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
      res.setHeader('Content-Length', end - start + 1);
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      res.setHeader('Content-Length', size);
      fs.createReadStream(file).pipe(res);
    }
  };
  return {
    name: 'serve-exam-media',
    configureServer: server => { server.middlewares.use(handler); },
    configurePreviewServer: server => { server.middlewares.use(handler); }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveExamMedia()],
  base: './',
  server: {
    port: 5174,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
