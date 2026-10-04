import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/env';
import { setupApiRoutes } from './routes/index';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(requestLogger);
  setupApiRoutes(app);
  app.use(errorHandler);
  return app;
}
