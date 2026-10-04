import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { AnalyticsController } from "../controllers/analyticsController";

const router = Router();
router.use(authMiddleware);
router.get('/stats', AnalyticsController.getStats);
router.get('/streak', AnalyticsController.getStreak);

export { router as analyticsRoutes };
