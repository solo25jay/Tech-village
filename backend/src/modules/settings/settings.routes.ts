import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@database/prisma';
import { ApiError } from '@common/ApiError';
import { asyncHandler } from '@common/asyncHandler';
import { recordAuditLog } from '@common/audit';
import { SETTING_DEFINITIONS, getSetting, isSettingKey } from '@common/settings';
import type { SettingKey } from '@common/settings';
import { requireAuth } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/rbac.middleware';

export const settingsRouter = Router();

settingsRouter.use(requireAuth, requirePermission('admin:settings:manage'));

const updateSchema = z.object({
  value: z.string().min(1).max(500),
});

settingsRouter.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const keys = Object.keys(SETTING_DEFINITIONS) as SettingKey[];
    const settings = await Promise.all(
      keys.map(async (key) => ({
        key,
        label: SETTING_DEFINITIONS[key].label,
        value: await getSetting(key),
      })),
    );
    res.json({ data: settings });
  }),
);

settingsRouter.put(
  '/:key',
  asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    if (!isSettingKey(key)) throw ApiError.badRequest(`Unknown setting: ${key}`);

    const { value } = updateSchema.parse(req.body);

    await prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await recordAuditLog({
      actorId: req.auth!.userId,
      action: 'setting.updated',
      entity: 'PlatformSetting',
      entityId: key,
    });

    res.json({ data: { key, value } });
  }),
);
