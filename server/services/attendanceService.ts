import { Attendance } from "../models";
import { HttpError } from "../utils/httpError";

export class AttendanceService {
  static async getToday(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    let attendance = await Attendance.findOne({ userId: userId, date: today });

    if (!attendance) {
      attendance = new Attendance({
        userId: userId,
        date: today,
        breaks: [],
        totalWorkingMinutes: 0,
        totalBreakMinutes: 0,
        status: 'not-started'
      });
      await attendance.save();
    }

    // Calculate total break time from all break sessions
    let totalBreakMinutes = 0;
    attendance.breaks.forEach(breakSession => {
      if (breakSession.endTime) {
        totalBreakMinutes += Math.floor((breakSession.endTime.getTime() - breakSession.startTime.getTime()) / (1000 * 60));
      } else if (attendance.status === 'on-break') {
        // Current ongoing break
        totalBreakMinutes += Math.floor((new Date().getTime() - breakSession.startTime.getTime()) / (1000 * 60));
      }
    });

    // Calculate total working time = (checkIn to current/checkout) - total breaks
    let totalWorkingMinutes = 0;
    if (attendance.checkInTime) {
      const endTime = attendance.checkOutTime || new Date();
      const totalTimeMinutes = Math.floor((endTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60));
      totalWorkingMinutes = Math.max(0, totalTimeMinutes - totalBreakMinutes);
    }

    let currentBreakStart = undefined;
    if (attendance.status === 'on-break' && attendance.breaks.length > 0) {
      const currentBreak = attendance.breaks[attendance.breaks.length - 1];
      if (!currentBreak.endTime) {
        currentBreakStart = currentBreak.startTime;
      }
    }

    return {
      status: attendance.status,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      workingHours: totalWorkingMinutes,
      breakTime: totalBreakMinutes,
      breaks: attendance.breaks,
      currentBreakStart
    };
  }

  static async clockIn(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    await Attendance.findOneAndUpdate(
      { userId: userId, date: today },
      {
        checkInTime: now,
        status: 'working'
      },
      { upsert: true }
    );

    return { success: true };
  }

  static async clockOut(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const attendance = await Attendance.findOne({ userId: userId, date: today });
    if (!attendance || !attendance.checkInTime) {
      throw new HttpError(400, 'Must clock in first');
    }

    await Attendance.findOneAndUpdate(
      { userId: userId, date: today },
      {
        checkOutTime: now,
        status: 'checked-out'
      }
    );

    return { success: true };
  }

  static async startBreak(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const attendance = await Attendance.findOne({ userId: userId, date: today });
    if (!attendance || attendance.status !== 'working') {
      throw new HttpError(400, 'Must be working to start break');
    }

    await Attendance.findOneAndUpdate(
      { userId: userId, date: today },
      {
        $push: { breaks: { startTime: now } },
        status: 'on-break'
      }
    );

    return { success: true };
  }

  static async endBreak(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const attendance = await Attendance.findOne({ userId: userId, date: today });
    if (!attendance || attendance.status !== 'on-break') {
      throw new HttpError(400, 'Must be on break to end break');
    }

    const currentBreak = attendance.breaks[attendance.breaks.length - 1];
    if (!currentBreak) {
      throw new HttpError(400, 'No active break found');
    }

    await Attendance.findOneAndUpdate(
      { userId: userId, date: today, 'breaks._id': currentBreak._id },
      {
        'breaks.$.endTime': now,
        status: 'working'
      }
    );

    return { success: true };
  }
}
