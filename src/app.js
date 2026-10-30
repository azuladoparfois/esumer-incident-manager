import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { openapi } from './config/openapi.js';
import { isDatabaseReady } from './config/database.js';
import { incidentService } from './services/incidents.js';
import { incidentRouter } from './routes/incidents.js';
import { errorHandler } from './middleware/errors.js';

export function createApp({ origins = [], service = incidentService, ready = isDatabaseReady } = {}) {
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/health/live', (_req, res) => res.json({ status: 'ok' }));
  app.get('/health/ready', async (_req, res) => { let available = false; try { available = await ready(); } catch { /* database unavailable */ } res.status(available ? 200 : 503).json({ status: available ? 'ok' : 'unavailable' }); });
  app.get('/openapi.json', (_req, res) => res.json(openapi));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, { swaggerOptions: { url: '/openapi.json' } }));
  app.use('/api/incidents', incidentRouter(service));
  app.use((_req, res) => res.status(404).json({ error: { message: 'Ruta no encontrada' } }));
  app.use(errorHandler);
  return app;
}
