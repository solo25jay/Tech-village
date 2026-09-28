export type CommunityPlatform = 'DISCORD' | 'TELEGRAM';
export type CommunityType = 'GENERAL' | 'PROFESSIONAL';

export interface CommunityAccessLink {
  platform: CommunityPlatform;
  type: CommunityType;
  url: string;
  onboardingInstructions: string;
}

/**
 * Tech Village never recreates Discord/Telegram — it only tracks eligibility
 * and hands out the right invite/access link. Phase 5 can extend this with
 * OAuth-based role sync (assignRole/revokeRole) without touching the rest
 * of the app, since everything else talks to this interface only.
 */
export interface CommunityProvider {
  getAccessLink(type: CommunityType): Promise<CommunityAccessLink>;
}
