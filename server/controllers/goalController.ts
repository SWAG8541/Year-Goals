import { Response } from 'express';
import { AuthRequest } from '../auth';
import { GoalService, TaskService } from '../services';
import { createGoalSchema } from '../../shared/schema';
import { z } from 'zod';

export class GoalController {
  static async getGoals(req: AuthRequest, res: Response) {
    try {
      const goals = await GoalService.getGoalsByUserId(req.userId!);
      res.json(goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ message: 'Failed to fetch goals' });
    }
  }

  static async createGoal(req: AuthRequest, res: Response) {
    try {
      const data = createGoalSchema.parse(req.body);
      const goal = await GoalService.createGoal(req.userId!, data);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Error creating goal:', error);
      res.status(500).json({ message: 'Failed to create goal' });
    }
  }

  static async deleteGoal(req: AuthRequest, res: Response) {
    try {
      await GoalService.deleteGoal(req.params.id, req.userId!);
      await TaskService.deleteTasksByGoalId(req.params.id, req.userId!);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ message: 'Failed to delete goal' });
    }
  }
}