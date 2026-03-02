import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import usersRouter from './routes/users.js';
import chartsRouter from './routes/charts.js';
import insightsRouter from './routes/insights.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/users', usersRouter);
app.use('/api/charts', chartsRouter);
app.use('/api/insights', insightsRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[server] listening on :${config.port}`);
});
