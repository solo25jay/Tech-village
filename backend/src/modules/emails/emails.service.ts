import { ApiError } from '@common/ApiError';
import { emailsRepository } from './emails.repository';
import { createEmailProvider } from '@integrations/email/emailProviderFactory';
import { recordAuditLog } from '@common/audit';
import { logger } from '@config/logger';

const emailProvider = createEmailProvider();

function applyVariables(body: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((text, [key, value]) => text.replaceAll(`[${key}]`, value), body);
}

export const emailsService = {
  listCampaigns() {
    return emailsRepository.listCampaigns();
  },

  createDraft(actorId: string, input: { subject: string; body: string; segment: string }) {
    return emailsRepository.createCampaign({
      createdById: actorId,
      subject: input.subject,
      body: input.body,
      segment: input.segment,
    });
  },

  /**
   * Sends synchronously in the request — fine for the recipient counts a
   * community platform like this has at MVP scale. At real scale this
   * would enqueue to a background worker instead of blocking the request;
   * the EmailProvider abstraction underneath doesn't change either way.
   */
  async send(campaignId: string) {
    const campaign = await emailsRepository.findCampaign(campaignId);
    if (!campaign) throw ApiError.notFound('Campaign not found');
    if (campaign.status === 'SENT' || campaign.status === 'SENDING') {
      throw ApiError.badRequest('This campaign has already been sent or is sending');
    }

    await emailsRepository.updateCampaignStatus(campaignId, 'SENDING');

    const recipients = await emailsRepository.listUsersForSegment(campaign.segment);

    let successCount = 0;
    for (const recipient of recipients) {
      try {
        await emailProvider.send({
          to: recipient.email,
          subject: campaign.subject,
          html: applyVariables(campaign.body, { 'First Name': recipient.firstName }),
        });
        successCount += 1;
      } catch (err) {
        logger.error({ err, recipient: recipient.email }, 'Campaign email failed for recipient');
      }
    }

    const finalStatus = successCount > 0 ? 'SENT' : 'FAILED';
    const updated = await emailsRepository.updateCampaignStatus(campaignId, finalStatus, successCount);

    await recordAuditLog({
      actorId: campaign.createdById,
      action: 'email_campaign.sent',
      entity: 'EmailCampaign',
      entityId: campaignId,
      metadata: { segment: campaign.segment, recipientCount: successCount },
    });

    return updated;
  },
};
