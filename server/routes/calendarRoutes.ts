import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { CalendarController } from "../controllers/calendarController";

const router = Router();
router.use(authMiddleware);
router.get('/', CalendarController.getDays);
router.post('/', CalendarController.saveDay);
router.delete('/:date', CalendarController.deleteDay);

export { router as calendarRoutes };
