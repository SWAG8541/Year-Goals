import { UserModel, CalendarDayModel, UserGoalModel } from "./db";
import type { User, CalendarDay, UserGoal, InsertCalendarDay, InsertUserGoal } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<any | null>;
  createUser(email: string, password: string, firstName?: string, lastName?: string): Promise<User>;
  updateUserProfile(id: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string }): Promise<User | null>;
  
  // Calendar day operations
  getCalendarDays(userId: string): Promise<CalendarDay[]>;
  getCalendarDay(userId: string, date: string): Promise<CalendarDay | null>;
  upsertCalendarDay(userId: string, data: InsertCalendarDay): Promise<CalendarDay>;
  deleteCalendarDay(userId: string, date: string): Promise<void>;
  
  // User goal operations
  getUserGoal(userId: string): Promise<UserGoal | null>;
  upsertUserGoal(userId: string, data: InsertUserGoal): Promise<UserGoal>;
  
  // WhatsApp notifications
  updateWhatsAppNotifications(userId: string, enabled: boolean): Promise<void>;
  
  // Analytics
  getCompletionStats(userId: string, year: number): Promise<{ total: number; completed: number; percentage: number }>;
  getCurrentStreak(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).select("-password").lean();
    return user ? { ...user, _id: user._id.toString() } as User : null;
  }

  async getUserByEmail(email: string): Promise<any | null> {
    return UserModel.findOne({ email }).lean();
  }

  async getUserByPhone(phone: string): Promise<any | null> {
    return UserModel.findOne({ phone }).lean();
  }

  async getUserByIdentifier(identifier: string): Promise<any | null> {
    return UserModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    }).lean();
  }

  async createUser(email: string, phone: string, password: string, firstName?: string, lastName?: string): Promise<User> {
    const user = await UserModel.create({ email, phone, password, firstName, lastName });
    const { password: _, ...userWithoutPassword } = user.toObject();
    return { ...userWithoutPassword, _id: userWithoutPassword._id.toString() } as User;
  }

  async getCalendarDays(userId: string): Promise<CalendarDay[]> {
    const days = await CalendarDayModel.find({ userId }).lean();
    return days.map(day => ({ ...day, _id: day._id.toString(), userId: day.userId.toString() }));
  }

  async getCalendarDay(userId: string, date: string): Promise<CalendarDay | null> {
    const day = await CalendarDayModel.findOne({ userId, date }).lean();
    return day ? { ...day, _id: day._id.toString(), userId: day.userId.toString() } : null;
  }

  async upsertCalendarDay(userId: string, data: InsertCalendarDay): Promise<CalendarDay> {
    const day = await CalendarDayModel.findOneAndUpdate(
      { userId, date: data.date },
      { ...data, userId },
      { new: true, upsert: true }
    ).lean();
    return { ...day!, _id: day!._id.toString(), userId: day!.userId.toString() };
  }

  async deleteCalendarDay(userId: string, date: string): Promise<void> {
    await CalendarDayModel.deleteOne({ userId, date });
  }

  async getUserGoal(userId: string): Promise<UserGoal | null> {
    const goal = await UserGoalModel.findOne({ userId }).lean();
    return goal ? { ...goal, _id: goal._id.toString(), userId: goal.userId.toString() } : null;
  }

  async upsertUserGoal(userId: string, data: InsertUserGoal): Promise<UserGoal> {
    const goal = await UserGoalModel.findOneAndUpdate(
      { userId },
      { ...data, userId },
      { new: true, upsert: true }
    ).lean();
    return { ...goal!, _id: goal!._id.toString(), userId: goal!.userId.toString() };
  }

  async getCompletionStats(userId: string, year: number): Promise<{ total: number; completed: number; percentage: number }> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const days = await CalendarDayModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).lean();
    
    const total = days.length;
    const completed = days.filter(d => d.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }

  async getCurrentStreak(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const days = await CalendarDayModel.find({ userId, completed: true })
      .sort({ date: -1 })
      .lean();
    
    if (days.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const day of days) {
      const dayDate = new Date(day.date);
      const diffDays = Math.floor((currentDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  async updateWhatsAppNotifications(userId: string, enabled: boolean): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { whatsappNotifications: enabled });
  }

  async updateUserProfile(id: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string }): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true }).select("-password").lean();
    return user ? { ...user, _id: user._id.toString() } as User : null;
  }
}

export const storage = new DatabaseStorage();
