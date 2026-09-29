import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Vite dev server middleware to invoke Vercel serverless API handlers during local dev
function serverlessApiPlugin(): Plugin {
  return {
    name: 'serverless-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (req.url?.startsWith('/api/gemini')) {
            const { default: geminiHandler } = await import('./api/gemini');
            return await geminiHandler(req, res);
          }
          if (req.url?.startsWith('/api/movies')) {
            const { default: moviesHandler } = await import('./api/movies');
            return await moviesHandler(req, res);
          }
        } catch (err: any) {
          console.error('Serverless middleware execution error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'INTERNAL_ERROR', message: err?.message || 'Serverless error' }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverlessApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
