import { prisma } from '@database/prisma';
import { env } from '@config/env';

/**
 * The settings admins can edit from the UI. Each has an env-var default so
 * the app works with zero rows in the PlatformSetting table.
 */
export const SETTING_DEFINITIONS = {
  discord_general_url: { label: 'Discord — General community invite link', default: () => env.discordGeneralUrl },
  discord_professional_url: {
    label: 'Discord — Professional community invite link',
    default: () => env.discordProfessionalUrl,
  },
  telegram_general_url: { label: 'Telegram — General group link', default: () => env.telegramGeneralUrl },
  support_email: { label: 'Support email address', default: () => 'support@techvillage.example' },
} as const;

export type SettingKey = keyof typeof SETTING_DEFINITIONS;

export function isSettingKey(key: string): key is SettingKey {
  return key in SETTING_DEFINITIONS;
}

/** Returns the admin-set value if one exists, otherwise the env/default value. */
export async function getSetting(key: SettingKey): Promise<string> {
  try {
    const row = await prisma.platformSetting.findUnique({ where: { key } });
    if (row) return row.value;
  } catch {
    // If the settings table is unreachable, fall back rather than break the caller.
  }
  return SETTING_DEFINITIONS[key].default();
}
