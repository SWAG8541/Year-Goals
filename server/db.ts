import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/year-goals";

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// User Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
  whatsappNotifications: { type: Boolean, default: false },
}, { timestamps: true });

export const UserModel = mongoose.model("User", userSchema);

// Calendar Day Model
const calendarDaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  completed: { type: Boolean, default: false },
  note: String,
  dayGoal: String,
}, { timestamps: true });

calendarDaySchema.index({ userId: 1, date: 1 }, { unique: true });

export const CalendarDayModel = mongoose.model("CalendarDay", calendarDaySchema);

// User Goal Model
const userGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  goal: { type: String, required: true },
}, { timestamps: true });

export const UserGoalModel = mongoose.model("UserGoal", userGoalSchema);
