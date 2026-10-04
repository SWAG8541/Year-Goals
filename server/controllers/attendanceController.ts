import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import { AttendanceService } from "../services/attendanceService";
import { handleControllerError } from "../utils/httpError";

export class AttendanceController {
  static async getToday(req: AuthRequest, res: Response) {
    try {
      res.json(await AttendanceService.getToday(req.userId!));
    } catch (error) {
      handleControllerError(error, res, 'Failed to fetch attendance');
    }
  }

  static async clockIn(req: AuthRequest, res: Response) {
    try {
      res.json(await AttendanceService.clockIn(req.userId!));
    } catch (error) {
      handleControllerError(error, res, 'Failed to clock in');
    }
  }

  static async clockOut(req: AuthRequest, res: Response) {
    try {
      res.json(await AttendanceService.clockOut(req.userId!));
    } catch (error) {
      handleControllerError(error, res, 'Failed to clock out');
    }
  }

  static async startBreak(req: AuthRequest, res: Response) {
    try {
      res.json(await AttendanceService.startBreak(req.userId!));
    } catch (error) {
      handleControllerError(error, res, 'Failed to start break');
    }
  }

  static async endBreak(req: AuthRequest, res: Response) {
    try {
      res.json(await AttendanceService.endBreak(req.userId!));
    } catch (error) {
      handleControllerError(error, res, 'Failed to end break');
    }
  }
}
