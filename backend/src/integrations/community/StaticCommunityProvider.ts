import type { CommunityAccessLink, CommunityProvider, CommunityType } from './CommunityProvider';
import { getSetting } from '@common/settings';

const ONBOARDING: Record<CommunityType, string> = {
  GENERAL:
    'Join the Tech Village Discord and introduce yourself in #introductions. Read the community rules in #announcements before posting.',
  PROFESSIONAL:
    'You now have access to the Professional community. Join the Professional Discord for #jobs, #freelancing and #opportunities channels.',
};

/**
 * MVP implementation of CommunityProvider: Tech Village never talks to the
 * Discord/Telegram APIs directly (per spec, no recreation of Discord
 * functionality). It hands out invite links that admins manage from the
 * Settings screen (falling back to env-var defaults). Swapping this for
 * OAuth-based role assignment later (Phase 5+) means implementing a new
 * CommunityProvider — nothing that calls this interface needs to change.
 */
export class StaticCommunityProvider implements CommunityProvider {
  async getAccessLink(type: CommunityType): Promise<CommunityAccessLink> {
    const url = await getSetting(type === 'GENERAL' ? 'discord_general_url' : 'discord_professional_url');

    return {
      platform: 'DISCORD',
      type,
      url,
      onboardingInstructions: ONBOARDING[type],
    };
  }
}
