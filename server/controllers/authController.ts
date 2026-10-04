import type { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/authMiddleware';
import { loginSchema, registerSchema } from '../validators/schema';
import { AuthError, AuthService } from '../services/authService';

const tokenCookieOptions = { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 };

function handleAuthError(error: unknown, res: Response, message: string) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: 'Invalid input', errors: error.errors });
  }
  if (error instanceof AuthError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(message, error);
  return res.status(500).json({ message });
}

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(registerSchema.parse(req.body));
      res.cookie('token', result.token, tokenCookieOptions);
      res.json(result);
    } catch (error) {
      handleAuthError(error, res, 'Registration failed');
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(loginSchema.parse(req.body));
      res.cookie('token', result.token, tokenCookieOptions);
      res.json(result);
    } catch (error) {
      handleAuthError(error, res, 'Login failed');
    }
  }

  static logout(_req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  }

  static async getUser(req: AuthRequest, res: Response) {
    try {
      res.json(await AuthService.getUser(req.userId!));
    } catch (error) {
      handleAuthError(error, res, 'Failed to fetch user');
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { firstName, lastName, email, phone } = req.body;
      res.json(await AuthService.updateProfile(req.userId!, { firstName, lastName, email, phone }));
    } catch (error) {
      handleAuthError(error, res, 'Failed to update profile');
    }
  }
}
