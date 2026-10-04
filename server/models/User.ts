import mongoose from 'mongoose';

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

export const User = mongoose.model("User", userSchema);
