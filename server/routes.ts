import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCalendarDaySchema, insertUserGoalSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Calendar day routes
  app.get('/api/calendar-days', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = await storage.getCalendarDays(userId);
      res.json(days);
    } catch (error) {
      console.error("Error fetching calendar days:", error);
      res.status(500).json({ message: "Failed to fetch calendar days" });
    }
  });

  app.post('/api/calendar-days', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertCalendarDaySchema.parse({
        ...req.body,
        userId,
      });
      const day = await storage.upsertCalendarDay(data);
      res.json(day);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error upserting calendar day:", error);
      res.status(500).json({ message: "Failed to save calendar day" });
    }
  });

  app.delete('/api/calendar-days/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.params;
      await storage.deleteCalendarDay(userId, date);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting calendar day:", error);
      res.status(500).json({ message: "Failed to delete calendar day" });
    }
  });

  // User goal routes
  app.get('/api/user-goal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goal = await storage.getUserGoal(userId);
      res.json(goal || { goal: "" });
    } catch (error) {
      console.error("Error fetching user goal:", error);
      res.status(500).json({ message: "Failed to fetch user goal" });
    }
  });

  app.post('/api/user-goal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertUserGoalSchema.parse({
        ...req.body,
        userId,
      });
      const goal = await storage.upsertUserGoal(data);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error upserting user goal:", error);
      res.status(500).json({ message: "Failed to save user goal" });
    }
  });

  return httpServer;
}
