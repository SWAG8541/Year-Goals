import type { Response } from 'express';
import { z } from 'zod';

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export function handleControllerError(error: unknown, res: Response, message: string) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: 'Invalid input', errors: error.errors });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(message, error);
  return res.status(500).json({ message });
}
