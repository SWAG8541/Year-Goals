import { Goal } from '../models';

export class GoalService {
  static async getGoalsByUserId(userId: string) {
    return Goal.find({ userId }).sort({ createdAt: -1 });
  }

  static async createGoal(userId: string, goalData: { title: string; description?: string }) {
    const goal = new Goal({ ...goalData, userId });
    return goal.save();
  }

  static async deleteGoal(goalId: string, userId: string) {
    return Goal.findOneAndDelete({ _id: goalId, userId });
  }
}