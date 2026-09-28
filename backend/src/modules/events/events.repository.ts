import { prisma } from '@database/prisma';

export const eventsRepository = {
  listUpcoming() {
    return prisma.event.findMany({
      where: { status: { not: 'CANCELLED' }, endTime: { gte: new Date() } },
      orderBy: { startTime: 'asc' },
      include: { _count: { select: { registrations: true } } },
    });
  },

  findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { registrations: true } } },
    });
  },

  listHostedBy(hostId: string) {
    return prisma.event.findMany({
      where: { hostId },
      orderBy: { startTime: 'desc' },
      include: { _count: { select: { registrations: true } } },
    });
  },

  listAll() {
    return prisma.event.findMany({
      orderBy: { startTime: 'desc' },
      include: { _count: { select: { registrations: true } } },
    });
  },

  create(data: {
    title: string;
    description?: string;
    hostId: string;
    eventType: string;
    startTime: Date;
    endTime: Date;
    maxAttendees?: number;
    meetingProvider?: string;
    meetingUrl?: string;
  }) {
    return prisma.event.create({ data });
  },

  cancel(id: string) {
    return prisma.event.update({ where: { id }, data: { status: 'CANCELLED' } });
  },

  // ---- Registrations ----
  findRegistration(eventId: string, userId: string) {
    return prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId } } });
  },

  register(eventId: string, userId: string) {
    return prisma.eventRegistration.create({ data: { eventId, userId } });
  },

  countRegistrations(eventId: string) {
    return prisma.eventRegistration.count({ where: { eventId } });
  },

  listMyRegistrations(userId: string) {
    return prisma.eventRegistration.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { event: { startTime: 'asc' } },
    });
  },

  listAttendees(eventId: string) {
    return prisma.eventRegistration.findMany({
      where: { eventId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  },
};
