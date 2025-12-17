import { Response } from 'express';
import { AuthRequest } from '../auth';
import { TaskService } from '../services';
import { createTaskSchema } from '../../shared/schema';
import { z } from 'zod';

export class TaskController {
  static async getTasks(req: AuthRequest, res: Response) {
    try {
      const tasks = await TaskService.getTasksByGoalId(req.params.goalId, req.userId!);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  }

  static async createTask(req: AuthRequest, res: Response) {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await TaskService.createTask(req.userId!, data);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Error creating task:', error);
      res.status(500).json({ message: 'Failed to create task' });
    }
  }

  static async toggleTask(req: AuthRequest, res: Response) {
    try {
      const task = await TaskService.toggleTask(req.params.id, req.userId!);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (error) {
      console.error('Error toggling task:', error);
      res.status(500).json({ message: 'Failed to toggle task' });
    }
  }

  static async deleteTask(req: AuthRequest, res: Response) {
    try {
      await TaskService.deleteTask(req.params.id, req.userId!);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  }
}