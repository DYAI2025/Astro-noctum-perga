import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import usersRouter from './routes/users.js';
import chartsRouter from './routes/charts.js';
import insightsRouter from './routes/insights.js';
import elevenlabsRouter from './routes/elevenlabs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/users', usersRouter);
app.use('/api/charts', chartsRouter);
app.use('/api/insights', insightsRouter);
app.use('/api', elevenlabsRouter);

app.use(errorHandler);

// Production: serve Vite build from dist/
if (isProd) {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`[server] listening on :${config.port} (${isProd ? 'production' : 'development'})`);
});
