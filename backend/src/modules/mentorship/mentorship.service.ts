import { ApiError } from '@common/ApiError';
import { mentorshipRepository } from './mentorship.repository';
import { createEmailProvider } from '@integrations/email/emailProviderFactory';
import { ManualMeetingProvider } from '@integrations/meeting/ManualMeetingProvider';

const emailProvider = createEmailProvider();
const meetingProvider = new ManualMeetingProvider();

/** Strips the private mentor note before anything reaches a mentee. */
function sanitizeForMentee<T extends { note?: string | null }>(mentorship: T) {
  const { note, ...rest } = mentorship;
  return rest;
}

export const mentorshipService = {
  // ---- Becoming a mentor ----
  async applyAsMentor(userId: string, input: { title?: string; bio?: string; expertise: string[]; hourlyRate?: number }) {
    const existing = await mentorshipRepository.findProfileByUserId(userId);
    if (existing) throw ApiError.conflict('You have already applied to become a mentor');
    return mentorshipRepository.createProfile({ userId, ...input });
  },

  // ---- Marketplace ----
  listApprovedMentors() {
    return mentorshipRepository.listApprovedMentors();
  },

  async getMentorProfile(id: string) {
    const profile = await mentorshipRepository.findProfileById(id);
    if (!profile || !profile.isApproved) throw ApiError.notFound('Mentor not found');
    return profile;
  },

  // ---- Requesting mentorship (learner) ----
  async requestMentorship(menteeId: string, mentorProfileId: string) {
    const profile = await mentorshipRepository.findProfileById(mentorProfileId);
    if (!profile || !profile.isApproved) throw ApiError.notFound('Mentor not found');
    if (profile.userId === menteeId) throw ApiError.badRequest('You cannot request mentorship from yourself');

    const existing = await mentorshipRepository.findActiveOrPendingBetween(profile.userId, menteeId);
    if (existing) throw ApiError.conflict('You already have a mentorship request or relationship with this mentor');

    const mentorship = await mentorshipRepository.createRequest({
      mentorId: profile.userId,
      menteeId,
      mentorProfileId: profile.id,
    });

    await emailProvider.send({
      to: profile.user.email,
      subject: 'New mentorship request on Tech Village',
      html: `<p>You have a new mentorship request.</p>`,
    });

    return mentorship;
  },

  listMyMentorshipsAsMentee(menteeId: string) {
    return mentorshipRepository.listForMentee(menteeId);
  },

  listMyUpcomingSessionsAsMentee(menteeId: string) {
    return mentorshipRepository.listUpcomingSessionsForMentee(menteeId);
  },

  // ---- Mentor side ----
  async listMyMentorships(mentorUserId: string, status?: string) {
    const rows = await mentorshipRepository.listForMentor(mentorUserId, status);
    return rows; // mentor sees their own notes — no sanitization here
  },

  async respondToRequest(mentorUserId: string, mentorshipId: string, accept: boolean) {
    const mentorship = await mentorshipRepository.findMentorshipById(mentorshipId);
    if (!mentorship) throw ApiError.notFound('Mentorship request not found');
    if (mentorship.mentorId !== mentorUserId) throw ApiError.forbidden('Not authorized for this mentorship');
    if (mentorship.status !== 'REQUESTED') throw ApiError.badRequest('This request has already been handled');

    return mentorshipRepository.updateStatus(mentorshipId, accept ? 'ACCEPTED' : 'DECLINED');
  },

  async setPrivateNote(mentorUserId: string, mentorshipId: string, note: string) {
    const mentorship = await mentorshipRepository.findMentorshipById(mentorshipId);
    if (!mentorship) throw ApiError.notFound('Mentorship not found');
    if (mentorship.mentorId !== mentorUserId) throw ApiError.forbidden('Not authorized for this mentorship');
    return mentorshipRepository.updateNote(mentorshipId, note);
  },

  async scheduleSession(
    mentorUserId: string,
    mentorshipId: string,
    input: { scheduledAt: string; durationMins: number; meetingUrl?: string },
  ) {
    const mentorship = await mentorshipRepository.findMentorshipById(mentorshipId);
    if (!mentorship) throw ApiError.notFound('Mentorship not found');
    if (mentorship.mentorId !== mentorUserId) throw ApiError.forbidden('Not authorized for this mentorship');
    if (mentorship.status !== 'ACCEPTED' && mentorship.status !== 'ACTIVE') {
      throw ApiError.badRequest('Mentorship must be accepted before scheduling sessions');
    }

    // Meeting link comes through the abstracted MeetingProvider — the mentor
    // pastes a Zoom/Meet/Teams link (MVP); a real provider integration can
    // replace ManualMeetingProvider later without touching this service.
    const meeting = await meetingProvider.createMeeting({
      title: 'Tech Village mentorship session',
      startTime: new Date(input.scheduledAt),
      durationMins: input.durationMins,
      manualUrl: input.meetingUrl,
    } as any);

    if (mentorship.status === 'ACCEPTED') {
      await mentorshipRepository.updateStatus(mentorshipId, 'ACTIVE');
    }

    const session = await mentorshipRepository.createSession({
      mentorshipId,
      scheduledAt: new Date(input.scheduledAt),
      durationMins: input.durationMins,
      meetingProvider: meeting.provider,
      meetingUrl: meeting.meetingUrl,
    });

    await emailProvider.send({
      to: mentorship.mentee.email,
      subject: 'Your mentorship session is scheduled',
      html: `<p>Hi ${mentorship.mentee.firstName}, your session is scheduled for ${input.scheduledAt}.</p>`,
    });

    return session;
  },

  listMyUpcomingSessionsAsMentor(mentorUserId: string) {
    return mentorshipRepository.listUpcomingSessionsForMentor(mentorUserId);
  },
};

export { sanitizeForMentee };
