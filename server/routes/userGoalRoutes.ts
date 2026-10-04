import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { UserGoalController } from "../controllers/userGoalController";

const router = Router();
router.use(authMiddleware);
router.get('/', UserGoalController.getGoal);
router.post('/', UserGoalController.saveGoal);

export { router as userGoalRoutes };
