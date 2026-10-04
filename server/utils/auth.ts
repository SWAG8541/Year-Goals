import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env";

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, env.jwtSecret) as { userId: string };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

