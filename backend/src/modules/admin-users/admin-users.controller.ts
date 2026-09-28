import type { Request, Response } from 'express';
import { adminUsersService } from './admin-users.service';
import { roleNameSchema, setStatusSchema } from './admin-users.validation';

export const adminUsersController = {
  async listUsers(req: Request, res: Response) {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    res.json({ data: await adminUsersService.listUsers(search) });
  },

  async getUser(req: Request, res: Response) {
    res.json({ data: await adminUsersService.getUser(req.params.userId) });
  },

  async setStatus(req: Request, res: Response) {
    const input = setStatusSchema.parse(req.body);
    res.json({ data: await adminUsersService.setStatus(req.auth!.userId, req.params.userId, input.status) });
  },

  async listRoles(_req: Request, res: Response) {
    res.json({ data: await adminUsersService.listRoles() });
  },

  async assignRole(req: Request, res: Response) {
    const input = roleNameSchema.parse(req.body);
    res
      .status(201)
      .json({ data: await adminUsersService.assignRole(req.auth!.userId, req.params.userId, input.roleName) });
  },

  async removeRole(req: Request, res: Response) {
    res.json({
      data: await adminUsersService.removeRole(req.auth!.userId, req.params.userId, req.params.roleName),
    });
  },
};
