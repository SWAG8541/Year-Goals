import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: {
    type: String,
  },

  password: {
    type: String,
  },

  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
  },

  firstName: String,
  lastName: String,

  profileImageUrl: String,

  whatsappNotifications: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export const User = mongoose.model('User', userSchema);