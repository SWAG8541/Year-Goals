import { Router } from 'express';
import { authMiddleware } from '../auth';
import { GoalController } from '../controllers';

const router = Router();

router.get('/', authMiddleware, GoalController.getGoals);
router.post('/', authMiddleware, GoalController.createGoal);
router.delete('/:id', authMiddleware, GoalController.deleteGoal);

export { router as goalRoutes };