import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@common/ApiError';

/**
 * Permission-based authorization. Routes declare the permission key they
 * need (e.g. "courses:create", "mentees:message"); the actual role ->
 * permission mapping lives entirely in the database (Role/Permission/
 * RolePermission tables), so adding a new role or changing what a role
 * can do never requires touching route code.
 */
export function requirePermission(...anyOf: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(ApiError.unauthorized());
    const granted = req.auth.permissions;
    const ok = anyOf.some((perm) => granted.includes(perm));
    if (!ok) return next(ApiError.forbidden(`Missing permission: ${anyOf.join(' or ')}`));
    return next();
  };
}

/** Coarser role check, for the rare case a route is genuinely role-scoped. */
export function requireRole(...anyOf: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(ApiError.unauthorized());
    const ok = anyOf.some((role) => req.auth!.roles.includes(role));
    if (!ok) return next(ApiError.forbidden(`Requires role: ${anyOf.join(' or ')}`));
    return next();
  };
}
