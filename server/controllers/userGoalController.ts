import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import { UserGoalService } from "../services/userGoalService";
import { handleControllerError } from "../utils/httpError";
import { insertUserGoalSchema } from "../validators/schema";

export class UserGoalController {
  static async getGoal(req: AuthRequest, res: Response) {
    try {
      res.json(await UserGoalService.getGoal(req.userId!));
    } catch (error) {
      handleControllerError(error, res, "Failed to fetch user goal");
    }
  }

  static async saveGoal(req: AuthRequest, res: Response) {
    try {
      res.json(await UserGoalService.saveGoal(req.userId!, insertUserGoalSchema.parse(req.body)));
    } catch (error) {
      handleControllerError(error, res, "Failed to save user goal");
    }
  }
}
