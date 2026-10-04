import { CalendarDay } from "../models";
import type { CalendarDay as CalendarDayType, InsertCalendarDay } from "../validators/schema";

export class CalendarService {
  static async getCalendarDays(userId: string): Promise<CalendarDayType[]> {
    const days = await CalendarDay.find({ userId }).lean();
    return days.map(day => ({ ...day, note: day.note ?? undefined, dayGoal: day.dayGoal ?? undefined, _id: day._id.toString(), userId: day.userId.toString() }));
  }

  static async getCalendarDay(userId: string, date: string): Promise<CalendarDayType | null> {
    const day = await CalendarDay.findOne({ userId, date }).lean();
    return day ? { ...day, note: day.note ?? undefined, dayGoal: day.dayGoal ?? undefined, _id: day._id.toString(), userId: day.userId.toString() } : null;
  }

  static async upsertCalendarDay(userId: string, data: InsertCalendarDay): Promise<CalendarDayType> {
    const day = await CalendarDay.findOneAndUpdate(
      { userId, date: data.date },
      { ...data, userId },
      { new: true, upsert: true }
    ).lean();
    return { ...day!, note: day!.note ?? undefined, dayGoal: day!.dayGoal ?? undefined, _id: day!._id.toString(), userId: day!.userId.toString() };
  }

  static async deleteCalendarDay(userId: string, date: string): Promise<void> {
    await CalendarDay.deleteOne({ userId, date });
  }



  static async deleteDay(userId: string, date: string) {
    await CalendarService.deleteCalendarDay(userId, date);
    return { success: true };
  }
}
