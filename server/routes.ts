import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { authMiddleware, generateToken, hashPassword, comparePassword, type AuthRequest } from "./auth";
import { registerSchema, loginSchema, insertCalendarDaySchema, insertUserGoalSchema, createGoalSchema, createTaskSchema, createBlogPostSchema, createFeedPostSchema } from "../shared/schema";
import { sendWhatsAppMessage, generateDailyReminderMessage } from "./whatsapp";
import { Attendance } from "./attendance";
import { Goal, Task, BlogPost, FeedPost } from "./models";
import { setupApiRoutes } from "./routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  
  // Setup new MVC routes
  setupApiRoutes(app);
  
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser(data.email, data.phone, hashedPassword, data.firstName, data.lastName);
      
      const token = generateToken(user._id);
      res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      
      res.json({ user, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await comparePassword(data.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = generateToken(user._id.toString());
      res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
  });

  app.get('/api/auth/user', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put('/api/auth/profile', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { firstName, lastName, email, phone } = req.body;
      const user = await storage.updateUserProfile(req.userId!, { firstName, lastName, email, phone });
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Calendar day routes
  app.get('/api/calendar-days', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const days = await storage.getCalendarDays(req.userId!);
      res.json(days);
    } catch (error) {
      console.error("Error fetching calendar days:", error);
      res.status(500).json({ message: "Failed to fetch calendar days" });
    }
  });

  app.post('/api/calendar-days', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const data = insertCalendarDaySchema.parse(req.body);
      const day = await storage.upsertCalendarDay(req.userId!, data);
      res.json(day);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error upserting calendar day:", error);
      res.status(500).json({ message: "Failed to save calendar day" });
    }
  });

  app.delete('/api/calendar-days/:date', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { date } = req.params;
      await storage.deleteCalendarDay(req.userId!, date);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting calendar day:", error);
      res.status(500).json({ message: "Failed to delete calendar day" });
    }
  });

  // User goal routes
  app.get('/api/user-goal', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const goal = await storage.getUserGoal(req.userId!);
      res.json(goal || { goal: "" });
    } catch (error) {
      console.error("Error fetching user goal:", error);
      res.status(500).json({ message: "Failed to fetch user goal" });
    }
  });

  app.post('/api/user-goal', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const data = insertUserGoalSchema.parse(req.body);
      const goal = await storage.upsertUserGoal(req.userId!, data);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error upserting user goal:", error);
      res.status(500).json({ message: "Failed to save user goal" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const stats = await storage.getCompletionStats(req.userId!, year);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/analytics/streak', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const streak = await storage.getCurrentStreak(req.userId!);
      res.json({ streak });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  // Attendance routes
  app.get('/api/attendance/today', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      let attendance = await Attendance.findOne({ userId: req.userId!, date: today });
      
      if (!attendance) {
        attendance = new Attendance({
          userId: req.userId!,
          date: today,
          breaks: [],
          totalWorkingMinutes: 0,
          totalBreakMinutes: 0,
          status: 'not-started'
        });
        await attendance.save();
      }
      
      // Calculate total break time from all break sessions
      let totalBreakMinutes = 0;
      attendance.breaks.forEach(breakSession => {
        if (breakSession.endTime) {
          totalBreakMinutes += Math.floor((breakSession.endTime.getTime() - breakSession.startTime.getTime()) / (1000 * 60));
        } else if (attendance.status === 'on-break') {
          // Current ongoing break
          totalBreakMinutes += Math.floor((new Date().getTime() - breakSession.startTime.getTime()) / (1000 * 60));
        }
      });
      
      // Calculate total working time = (checkIn to current/checkout) - total breaks
      let totalWorkingMinutes = 0;
      if (attendance.checkInTime) {
        const endTime = attendance.checkOutTime || new Date();
        const totalTimeMinutes = Math.floor((endTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60));
        totalWorkingMinutes = Math.max(0, totalTimeMinutes - totalBreakMinutes);
      }
      
      let currentBreakStart = undefined;
      if (attendance.status === 'on-break' && attendance.breaks.length > 0) {
        const currentBreak = attendance.breaks[attendance.breaks.length - 1];
        if (!currentBreak.endTime) {
          currentBreakStart = currentBreak.startTime;
        }
      }
      
      res.json({
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        workingHours: totalWorkingMinutes,
        breakTime: totalBreakMinutes,
        currentBreakStart
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ message: 'Failed to fetch attendance' });
    }
  });

  app.post('/api/attendance/clock-in', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      
      await Attendance.findOneAndUpdate(
        { userId: req.userId!, date: today },
        {
          checkInTime: now,
          status: 'working'
        },
        { upsert: true }
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error clocking in:', error);
      res.status(500).json({ message: 'Failed to clock in' });
    }
  });

  app.post('/api/attendance/clock-out', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      
      const attendance = await Attendance.findOne({ userId: req.userId!, date: today });
      if (!attendance || !attendance.checkInTime) {
        return res.status(400).json({ message: 'Must clock in first' });
      }
      
      await Attendance.findOneAndUpdate(
        { userId: req.userId!, date: today },
        {
          checkOutTime: now,
          status: 'checked-out'
        }
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error clocking out:', error);
      res.status(500).json({ message: 'Failed to clock out' });
    }
  });

  app.post('/api/attendance/break-start', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      
      const attendance = await Attendance.findOne({ userId: req.userId!, date: today });
      if (!attendance || attendance.status !== 'working') {
        return res.status(400).json({ message: 'Must be working to start break' });
      }
      
      await Attendance.findOneAndUpdate(
        { userId: req.userId!, date: today },
        {
          $push: { breaks: { startTime: now } },
          status: 'on-break'
        }
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error starting break:', error);
      res.status(500).json({ message: 'Failed to start break' });
    }
  });

  app.post('/api/attendance/break-end', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      
      const attendance = await Attendance.findOne({ userId: req.userId!, date: today });
      if (!attendance || attendance.status !== 'on-break') {
        return res.status(400).json({ message: 'Must be on break to end break' });
      }
      
      const currentBreak = attendance.breaks[attendance.breaks.length - 1];
      if (!currentBreak) {
        return res.status(400).json({ message: 'No active break found' });
      }
      
      await Attendance.findOneAndUpdate(
        { userId: req.userId!, date: today, 'breaks._id': currentBreak._id },
        {
          'breaks.$.endTime': now,
          status: 'working'
        }
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error ending break:', error);
      res.status(500).json({ message: 'Failed to end break' });
    }
  });

  // Note: Goals, Tasks, Blog, and Feed routes are now handled by MVC structure

  // WhatsApp notification routes
  app.post('/api/whatsapp/toggle', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { enabled } = req.body;
      await storage.updateWhatsAppNotifications(req.userId!, enabled);
      res.json({ success: true });
    } catch (error) {
      console.error("Error toggling WhatsApp:", error);
      res.status(500).json({ message: "Failed to update WhatsApp notifications" });
    }
  });

  app.get('/api/whatsapp/reminder-link', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const goal = await storage.getUserGoal(req.userId!);
      
      if (!user?.phone) {
        return res.status(400).json({ message: "Phone number required" });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const todayData = await storage.getCalendarDay(req.userId!, today);
      
      const message = generateDailyReminderMessage(goal?.goal || "Your daily goal", todayData?.note);
      const whatsappUrl = sendWhatsAppMessage(user.phone, message);
      
      res.json({ url: whatsappUrl });
    } catch (error) {
      console.error("Error generating WhatsApp link:", error);
      res.status(500).json({ message: "Failed to generate WhatsApp link" });
    }
  });

  return httpServer;
}
