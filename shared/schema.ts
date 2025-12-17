import { z } from "zod";

// User types
export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

// Calendar Day types
export interface CalendarDay {
  _id: string;
  userId: string;
  date: string; // Format: YYYY-MM-DD
  completed: boolean;
  note?: string;
  dayGoal?: string; // Specific goal for this day
  createdAt: Date;
  updatedAt: Date;
}

// User Goal types
export interface UserGoal {
  _id: string;
  userId: string;
  goal: string;
  createdAt: Date;
  updatedAt: Date;
}

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number required with country code (e.g., +1234567890)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertCalendarDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  completed: z.boolean(),
  note: z.string().optional(),
  dayGoal: z.string().optional(),
});

export const insertUserGoalSchema = z.object({
  goal: z.string().min(1, "Goal is required"),
});

// Task schemas
export const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export const createTaskSchema = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

// Blog schemas
export const createBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
});

// Feed schemas
export const createFeedPostSchema = z.object({
  type: z.enum(['goal', 'achievement', 'blog', 'progress']),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional(),
  progress: z.number().optional(),
  goalTitle: z.string().optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type InsertCalendarDay = z.infer<typeof insertCalendarDaySchema>;
export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;
export type CreateGoal = z.infer<typeof createGoalSchema>;
export type CreateTask = z.infer<typeof createTaskSchema>;
export type CreateBlogPost = z.infer<typeof createBlogPostSchema>;
export type CreateFeedPost = z.infer<typeof createFeedPostSchema>;
