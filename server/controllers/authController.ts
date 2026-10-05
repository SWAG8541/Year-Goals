import type { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/authMiddleware';
import { loginSchema, registerSchema } from '../validators/schema';
import { AuthError, AuthService } from '../services/authService';
import { randomUUID } from 'node:crypto';
import { log } from '../utils/logger';


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

  static async googleLogin(req: Request, res: Response) {
    const requestId = randomUUID();
    const startedAt = Date.now();
    const trace = (message: string) => log(`[${requestId}] ${message}`, 'google-auth');

    trace('Request received: POST /api/auth/google');
    trace(`Input fields present: email=${!!req.body?.email}, name=${!!req.body?.name}, uid=${!!req.body?.uid}, idToken=${!!req.body?.idToken}`);
    try {
      const result = await AuthService.googleLogin(z.object({ idToken: z.string().min(1).max(16384) }).parse(req.body), trace);
      res.cookie('token', result.token, tokenCookieOptions);
      trace('Application session cookie set');
      res.json(result);
      trace(`Login response sent (200), duration=${Date.now() - startedAt}ms`);
    } catch (error) {
      const status = error instanceof AuthError ? error.status : error instanceof z.ZodError ? 400 : 500;
      // Log categories only: raw database errors can contain personal data.
      trace(`Login failed: type=${error instanceof Error ? error.name : 'Unknown'}, status=${status}, duration=${Date.now() - startedAt}ms`);
      if (status === 500) {
        res.status(500).json({ message: 'Google login failed' });
      } else {
        handleAuthError(error, res, 'Google login failed');
      }
    }
  }
}
