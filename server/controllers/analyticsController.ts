import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import { AnalyticsService } from "../services/analyticsService";
import { handleControllerError } from "../utils/httpError";

export class AnalyticsController {
  static async getStats(req: AuthRequest, res: Response) {
    try {
      res.json(await AnalyticsService.getCompletionStats(req.userId!, parseInt(req.query.year as string) || new Date().getFullYear()));
    } catch (error) {
      handleControllerError(error, res, "Failed to fetch stats");
    }
  }

  static async getStreak(req: AuthRequest, res: Response) {
    try {
      res.json(await AnalyticsService.getStreak(req.userId!));
    } catch (error) {
      handleControllerError(error, res, "Failed to fetch streak");
    }
  }
}
