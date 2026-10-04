import mongoose from "mongoose";

// User Goal Model
const userGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  goal: { type: String, required: true },
}, { timestamps: true });

export const UserGoal = mongoose.model("UserGoal", userGoalSchema);
