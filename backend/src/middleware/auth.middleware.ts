import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@common/ApiError';
import { verifyAccessToken } from '@common/jwt';

export interface AuthContext {
  userId: string;
  roles: string[];
  permissions: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing bearer token'));
  }

  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length));
    req.auth = { userId: payload.sub, roles: payload.roles, permissions: payload.permissions };
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}
