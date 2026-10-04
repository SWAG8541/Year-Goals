import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(error.status || error.statusCode || 500)
    .json({ message: error.message || 'Internal Server Error' });
};
