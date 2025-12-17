import { Express } from 'express';
import { goalRoutes } from './goalRoutes';
import { taskRoutes } from './taskRoutes';
import { blogRoutes } from './blogRoutes';
import { feedRoutes } from './feedRoutes';

export function setupApiRoutes(app: Express) {
  app.use('/api/goals', goalRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/blog', blogRoutes);
  app.use('/api/feed', feedRoutes);
}