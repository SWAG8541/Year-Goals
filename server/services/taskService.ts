import { Task } from '../models';

export class TaskService {
  static async getTasksByGoalId(goalId: string, userId: string) {
    return Task.find({ goalId, userId }).sort({ createdAt: -1 });
  }

  static async createTask(userId: string, taskData: { title: string; description?: string; goalId: string }) {
    const task = new Task({ ...taskData, userId });
    return task.save();
  }

  static async toggleTask(taskId: string, userId: string) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) return null;
    
    task.completed = !task.completed;
    task.updatedAt = new Date();
    return task.save();
  }

  static async deleteTask(taskId: string, userId: string) {
    return Task.findOneAndDelete({ _id: taskId, userId });
  }

  static async deleteTasksByGoalId(goalId: string, userId: string) {
    return Task.deleteMany({ goalId, userId });
  }
}