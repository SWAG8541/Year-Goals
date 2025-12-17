import { Schema, model } from 'mongoose';

export interface AttendanceRecord {
  userId: string;
  date: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  breaks: {
    startTime: Date;
    endTime?: Date;
  }[];
  totalWorkingMinutes: number;
  totalBreakMinutes: number;
  status: 'not-started' | 'working' | 'on-break' | 'checked-out';
}

const attendanceSchema = new Schema<AttendanceRecord>({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  checkInTime: Date,
  checkOutTime: Date,
  breaks: [{
    startTime: { type: Date, required: true },
    endTime: Date
  }],
  totalWorkingMinutes: { type: Number, default: 0 },
  totalBreakMinutes: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['not-started', 'working', 'on-break', 'checked-out'],
    default: 'not-started'
  }
}, { timestamps: true });

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Attendance = model<AttendanceRecord>('Attendance', attendanceSchema);