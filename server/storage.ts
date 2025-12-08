import {
  users,
  calendarDays,
  userGoals,
  type User,
  type UpsertUser,
  type CalendarDay,
  type InsertCalendarDay,
  type UserGoal,
  type InsertUserGoal,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Calendar day operations
  getCalendarDays(userId: string): Promise<CalendarDay[]>;
  getCalendarDay(userId: string, date: string): Promise<CalendarDay | undefined>;
  upsertCalendarDay(data: InsertCalendarDay): Promise<CalendarDay>;
  deleteCalendarDay(userId: string, date: string): Promise<void>;
  
  // User goal operations
  getUserGoal(userId: string): Promise<UserGoal | undefined>;
  upsertUserGoal(data: InsertUserGoal): Promise<UserGoal>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Calendar day operations
  async getCalendarDays(userId: string): Promise<CalendarDay[]> {
    return await db
      .select()
      .from(calendarDays)
      .where(eq(calendarDays.userId, userId));
  }

  async getCalendarDay(userId: string, date: string): Promise<CalendarDay | undefined> {
    const [day] = await db
      .select()
      .from(calendarDays)
      .where(and(eq(calendarDays.userId, userId), eq(calendarDays.date, date)));
    return day;
  }

  async upsertCalendarDay(data: InsertCalendarDay): Promise<CalendarDay> {
    const [day] = await db
      .insert(calendarDays)
      .values(data)
      .onConflictDoUpdate({
        target: [calendarDays.userId, calendarDays.date],
        set: {
          completed: data.completed,
          note: data.note,
          updatedAt: new Date(),
        },
      })
      .returning();
    return day;
  }

  async deleteCalendarDay(userId: string, date: string): Promise<void> {
    await db
      .delete(calendarDays)
      .where(and(eq(calendarDays.userId, userId), eq(calendarDays.date, date)));
  }

  // User goal operations
  async getUserGoal(userId: string): Promise<UserGoal | undefined> {
    const [goal] = await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId));
    return goal;
  }

  async upsertUserGoal(data: InsertUserGoal): Promise<UserGoal> {
    const [goal] = await db
      .insert(userGoals)
      .values(data)
      .onConflictDoUpdate({
        target: userGoals.userId,
        set: {
          goal: data.goal,
          updatedAt: new Date(),
        },
      })
      .returning();
    return goal;
  }
}

export const storage = new DatabaseStorage();
