import { communityRepository } from './community.repository';
import { createCommunityProvider } from '@integrations/community/communityProviderFactory';
import { getSetting } from '@common/settings';
import { createEmailProvider } from '@integrations/email/emailProviderFactory';
import { prisma } from '@database/prisma';

const communityProvider = createCommunityProvider();
const emailProvider = createEmailProvider();

export const communityService = {
  /**
   * Every registered user is General-community eligible from day one (spec
   * section 28). Called lazily on first fetch so no extra work happens at
   * registration time, and it's idempotent (upsert), so it's safe to call
   * on every request.
   */
  async ensureGeneralAccess(userId: string) {
    const discordLink = await communityProvider.getAccessLink('GENERAL');

    await communityRepository.upsertAccess({
      userId,
      communityType: 'GENERAL',
      communityPlatform: 'DISCORD',
      accessUrl: discordLink.url,
      status: 'GRANTED',
    });

    await communityRepository.upsertAccess({
      userId,
      communityType: 'GENERAL',
      communityPlatform: 'TELEGRAM',
      accessUrl: await getSetting('telegram_general_url'),
      status: 'GRANTED',
    });
  },

  async getMyAccess(userId: string) {
    await this.ensureGeneralAccess(userId);
    const rows = await communityRepository.listForUser(userId);
    const profile = await communityRepository.findOrCreateProfessionalProfile(userId);

    return {
      access: rows,
      isProfessional: profile.isQualified,
      professionalOnboarding:
        !profile.isQualified
          ? 'Complete your learning path, required projects, assessments and certification to unlock the Professional community.'
          : null,
    };
  },

  // ---- Admin: professional qualification drives Professional community access ----
  listProfessionalProfiles() {
    return communityRepository.listProfessionalProfiles();
  },

  async setProfessionalQualification(userId: string, isQualified: boolean) {
    await communityRepository.setQualified(userId, isQualified);

    if (isQualified) {
      const discordLink = await communityProvider.getAccessLink('PROFESSIONAL');
      await communityRepository.upsertAccess({
        userId,
        communityType: 'PROFESSIONAL',
        communityPlatform: 'DISCORD',
        accessUrl: discordLink.url,
        status: 'GRANTED',
      });
    } else {
      await communityRepository.upsertAccess({
        userId,
        communityType: 'PROFESSIONAL',
        communityPlatform: 'DISCORD',
        accessUrl: await getSetting('discord_professional_url'),
        status: 'REVOKED',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await emailProvider.send({
        to: user.email,
        subject: isQualified ? 'You are now Tech Village Professional' : 'Professional status update',
        html: isQualified
          ? `<p>Congratulations ${user.firstName} — you're now Tech Village Professional. Join the Professional Discord to network and find opportunities.</p>`
          : `<p>Hi ${user.firstName}, your Professional community access has been updated.</p>`,
      });
    }
  },
};
