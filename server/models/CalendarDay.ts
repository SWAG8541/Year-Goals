import mongoose from "mongoose";

// Calendar Day Model
const calendarDaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  completed: { type: Boolean, default: false },
  note: String,
  dayGoal: String,
}, { timestamps: true });

calendarDaySchema.index({ userId: 1, date: 1 }, { unique: true });

export const CalendarDay = mongoose.model("CalendarDay", calendarDaySchema);

