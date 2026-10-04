import { UserGoal } from "../models";
import type { UserGoal as UserGoalType, InsertUserGoal } from "../validators/schema";

export class UserGoalService {
  static async getUserGoal(userId: string): Promise<UserGoalType | null> {
    const goal = await UserGoal.findOne({ userId }).lean();
    return goal ? { ...goal, _id: goal._id.toString(), userId: goal.userId.toString() } : null;
  }

  static async upsertUserGoal(userId: string, data: InsertUserGoal): Promise<UserGoalType> {
    const goal = await UserGoal.findOneAndUpdate(
      { userId },
      { ...data, userId },
      { new: true, upsert: true }
    ).lean();
    return { ...goal!, _id: goal!._id.toString(), userId: goal!.userId.toString() };
  }

  static async getGoal(userId: string) {
    const goal = await UserGoalService.getUserGoal(userId);
    return goal || { goal: "" };
  }

  static async saveGoal(userId: string, data: InsertUserGoal) {
    const goal = await UserGoalService.upsertUserGoal(userId, data);
    return goal;
  }
}
