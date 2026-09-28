import { prisma } from '@database/prisma';

export const mentorshipRepository = {
  // ---- Mentor profiles ----
  findProfileByUserId(userId: string) {
    return prisma.mentorProfile.findUnique({ where: { userId } });
  },

  createProfile(data: { userId: string; title?: string; bio?: string; expertise: string[]; hourlyRate?: number }) {
    return prisma.mentorProfile.create({ data });
  },

  listApprovedMentors() {
    return prisma.mentorProfile.findMany({
      where: { isApproved: true },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
  },

  listAllMentorProfiles() {
    return prisma.mentorProfile.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { id: 'desc' },
    });
  },

  findProfileById(id: string) {
    return prisma.mentorProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } } },
    });
  },

  setApproval(id: string, isApproved: boolean) {
    return prisma.mentorProfile.update({ where: { id }, data: { isApproved } });
  },

  // ---- Mentorship relationships ----
  findActiveOrPendingBetween(mentorId: string, menteeId: string) {
    return prisma.mentorship.findFirst({
      where: { mentorId, menteeId, status: { in: ['REQUESTED', 'ACCEPTED', 'ACTIVE'] } },
    });
  },

  createRequest(data: { mentorId: string; menteeId: string; mentorProfileId: string }) {
    return prisma.mentorship.create({ data });
  },

  findMentorshipById(id: string) {
    return prisma.mentorship.findUnique({
      where: { id },
      include: {
        mentee: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        sessions: { orderBy: { scheduledAt: 'asc' } },
      },
    });
  },

  listForMentee(menteeId: string) {
    return prisma.mentorship.findMany({
      where: { menteeId },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        mentorProfile: true,
        sessions: { orderBy: { scheduledAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  listForMentor(mentorId: string, status?: string) {
    return prisma.mentorship.findMany({
      where: { mentorId, ...(status ? { status: status as any } : {}) },
      include: {
        mentee: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        sessions: { orderBy: { scheduledAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  updateStatus(id: string, status: 'ACCEPTED' | 'DECLINED' | 'ACTIVE' | 'ENDED') {
    return prisma.mentorship.update({ where: { id }, data: { status } });
  },

  // Private mentor note — never returned on mentee-facing queries/controllers.
  updateNote(id: string, note: string) {
    return prisma.mentorship.update({ where: { id }, data: { note } });
  },

  // ---- Sessions ----
  createSession(data: {
    mentorshipId: string;
    scheduledAt: Date;
    durationMins: number;
    meetingProvider?: string;
    meetingUrl?: string;
  }) {
    return prisma.mentorshipSession.create({ data });
  },

  listUpcomingSessionsForMentor(mentorId: string) {
    return prisma.mentorshipSession.findMany({
      where: { mentorship: { mentorId }, scheduledAt: { gte: new Date() } },
      include: { mentorship: { include: { mentee: { select: { firstName: true, lastName: true } } } } },
      orderBy: { scheduledAt: 'asc' },
    });
  },

  listUpcomingSessionsForMentee(menteeId: string) {
    return prisma.mentorshipSession.findMany({
      where: { mentorship: { menteeId }, scheduledAt: { gte: new Date() } },
      include: { mentorship: { include: { mentor: { select: { firstName: true, lastName: true } } } } },
      orderBy: { scheduledAt: 'asc' },
    });
  },
};
