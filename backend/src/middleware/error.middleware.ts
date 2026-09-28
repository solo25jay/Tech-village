import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@common/ApiError';
import { logger } from '@config/logger';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.path}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) logger.error({ err }, 'Unhandled API error');
    return res.status(err.statusCode).json({
      error: { message: err.message, details: err.details ?? null },
    });
  }

  logger.error({ err }, 'Unexpected error');
  return res.status(500).json({ error: { message: 'Internal server error' } });
}
