import { Router } from 'express';
import { authMiddleware } from '../auth';
import { TaskController } from '../controllers';

const router = Router();

router.get('/:goalId', authMiddleware, TaskController.getTasks);
router.post('/', authMiddleware, TaskController.createTask);
router.put('/:id/toggle', authMiddleware, TaskController.toggleTask);
router.delete('/:id', authMiddleware, TaskController.deleteTask);

export { router as taskRoutes };