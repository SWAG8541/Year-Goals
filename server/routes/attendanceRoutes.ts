import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { AttendanceController } from "../controllers/attendanceController";

const router = Router();
router.use(authMiddleware);
router.get('/today', AttendanceController.getToday);
router.post('/clock-in', AttendanceController.clockIn);
router.post('/clock-out', AttendanceController.clockOut);
router.post('/break-start', AttendanceController.startBreak);
router.post('/break-end', AttendanceController.endBreak);

export { router as attendanceRoutes };
