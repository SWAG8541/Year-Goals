import { User } from '../models/User';
import { comparePassword, generateToken, hashPassword } from '../utils/auth';
import type { LoginInput, RegisterInput } from '../validators/schema';

export class AuthError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthService {
  static async register(data: RegisterInput) {
    if (await User.exists({ email: data.email })) {
      throw new AuthError(400, 'Email already registered');
    }
    const password = await hashPassword(data.password);
    try {
      const user = await User.create({ ...data, password });
      const { password: _, ...profile } = user.toObject();
      const publicUser = { ...profile, _id: profile._id.toString() };
      return { user: publicUser, token: generateToken(publicUser._id) };
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        throw new AuthError(400, 'Email already registered');
      }
      throw error;
    }
  }

  static async login(data: LoginInput) {
    const user = await User.findOne({ email: data.email }).lean();
    if (!user || !(await comparePassword(data.password, user.password))) {
      throw new AuthError(401, 'Invalid credentials');
    }
    const { password: _, ...profile } = user;
    const publicUser = { ...profile, _id: profile._id.toString() };
    return { user: publicUser, token: generateToken(publicUser._id) };
  }

  static async getUser(userId: string) {
    const user = await User.findById(userId).select('-password').lean();
    if (!user) throw new AuthError(404, 'User not found');
    return { ...user, _id: user._id.toString() };
  }

  static async updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string }) {
    const user = await User.findByIdAndUpdate(userId, data, { new: true }).select('-password').lean();
    if (!user) throw new AuthError(404, 'User not found');
    return { ...user, _id: user._id.toString() };
  }
}
