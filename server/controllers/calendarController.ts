import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import { CalendarService } from "../services/calendarService";
import { handleControllerError } from "../utils/httpError";
import { insertCalendarDaySchema } from "../validators/schema";

export class CalendarController {
  static async getDays(req: AuthRequest, res: Response) {
    try {
      res.json(await CalendarService.getCalendarDays(req.userId!));
    } catch (error) {
      handleControllerError(error, res, "Failed to fetch calendar days");
    }
  }

  static async saveDay(req: AuthRequest, res: Response) {
    try {
      res.json(await CalendarService.upsertCalendarDay(req.userId!, insertCalendarDaySchema.parse(req.body)));
    } catch (error) {
      handleControllerError(error, res, "Failed to save calendar day");
    }
  }

  static async deleteDay(req: AuthRequest, res: Response) {
    try {
      res.json(await CalendarService.deleteDay(req.userId!, req.params.date));
    } catch (error) {
      handleControllerError(error, res, "Failed to delete calendar day");
    }
  }
}
