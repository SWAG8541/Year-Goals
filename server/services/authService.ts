import { firebaseAuth } from '../utils/firebase';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { log } from '../utils/logger';
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
    if (!user || !user.password || !(await comparePassword(data.password, user.password))) {
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

  static async googleLogin(
    data: { idToken: string },
    trace: (message: string) => void = (message) => log(message, 'google-auth'),
  ) {
    trace('Verifying Firebase ID token');
    const auth = firebaseAuth();
    let identity: DecodedIdToken;
    try {
      identity = await auth.verifyIdToken(data.idToken);
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? String(error.code) : '';
      if (['auth/argument-error', 'auth/invalid-id-token', 'auth/id-token-expired',
        'auth/id-token-revoked', 'auth/user-disabled'].includes(code)) {
        throw new AuthError(401, 'Invalid or expired Google sign-in token');
      }
      throw error;
    }
    if (identity.firebase.sign_in_provider !== 'google.com' || !identity.email || !identity.email_verified) {
      throw new AuthError(401, 'A verified Google account is required');
    }
    trace('Firebase token verified; looking up user by Firebase UID');
    let user = await User.findOne({ firebaseUid: identity.uid });
    if (!user) {
      trace('Looking up existing account by verified email');
      user = await User.findOne({ email: identity.email });
      if (user?.firebaseUid && user.firebaseUid !== identity.uid) {
        throw new AuthError(409, 'Account is already linked to another Firebase user');
      }
      try {
        if (user) {
          trace('Linking verified Firebase UID to existing account');
          user.firebaseUid = identity.uid;
          await user.save();
        } else {
          trace('Creating MongoDB user');
          const [firstName, ...lastName] = (identity.name || '').trim().split(/\s+/);
          user = await User.create({ email: identity.email, firebaseUid: identity.uid,
            firstName, lastName: lastName.join(' '), profileImageUrl: identity.picture });
        }
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 11000) {
          throw new AuthError(409, 'Account changed during sign-in; please try again');
        }
        throw error;
      }
    }
    trace('MongoDB user ready; generating application JWT');
    const { password: _, ...profile } = user.toObject();
    const publicUser = { ...profile, _id: profile._id.toString() };
    const token = generateToken(publicUser._id);
    trace('Application JWT generated; service completed');
    return { user: publicUser, token };
  }
}
