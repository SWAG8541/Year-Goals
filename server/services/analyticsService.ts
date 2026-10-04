import { CalendarDay } from "../models";

export class AnalyticsService {
  static async getCompletionStats(userId: string, year: number): Promise<{ total: number; completed: number; percentage: number }> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const days = await CalendarDay.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    const total = days.length;
    const completed = days.filter(d => d.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }

  static async getCurrentStreak(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const days = await CalendarDay.find({ userId, completed: true })
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


  static async getStreak(userId: string) {
    const streak = await AnalyticsService.getCurrentStreak(userId);
    return { streak };
  }
}
