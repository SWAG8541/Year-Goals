import { whatsappRoutes } from "./whatsappRoutes";
import { attendanceRoutes } from "./attendanceRoutes";
import { analyticsRoutes } from "./analyticsRoutes";
import { userGoalRoutes } from "./userGoalRoutes";
import { calendarRoutes } from "./calendarRoutes";
import { Express } from 'express';
import { authRoutes } from './authRoutes';
import { goalRoutes } from './goalRoutes';
import { taskRoutes } from './taskRoutes';
import { blogRoutes } from './blogRoutes';
import { feedRoutes } from './feedRoutes';

export function setupApiRoutes(app: Express) {
  app.use("/api/whatsapp", whatsappRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/user-goal", userGoalRoutes);
  app.use("/api/calendar-days", calendarRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/goals', goalRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/blog', blogRoutes);
  app.use('/api/feed', feedRoutes);
}

