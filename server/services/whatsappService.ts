import { User } from "../models";
import { HttpError } from "../utils/httpError";
import { AuthService } from "./authService";
import { CalendarService } from "./calendarService";
import { UserGoalService } from "./userGoalService";
import { sendWhatsAppMessage, generateDailyReminderMessage } from "../utils/whatsapp";

export class WhatsAppService {
  static async updateNotifications(userId: string, enabled: boolean) {
    await User.findByIdAndUpdate(userId, { whatsappNotifications: enabled });
  }
  static async toggle(userId: string, enabled: boolean) {
    await WhatsAppService.updateNotifications(userId, enabled);
    return { success: true };
  }

  static async getReminderLink(userId: string) {
    const user = await AuthService.getUser(userId);
    const goal = await UserGoalService.getUserGoal(userId);

    if (!user?.phone) {
      throw new HttpError(400, "Phone number required");
    }

    const today = new Date().toISOString().split('T')[0];
    const todayData = await CalendarService.getCalendarDay(userId, today);

    const message = generateDailyReminderMessage(goal?.goal || "Your daily goal", todayData?.note);
    const whatsappUrl = sendWhatsAppMessage(user.phone, message);

    return { url: whatsappUrl };
  }
}
