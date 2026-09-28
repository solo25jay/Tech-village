import { ApiError } from '@common/ApiError';
import { eventsRepository } from './events.repository';
import { createEmailProvider } from '@integrations/email/emailProviderFactory';
import { ManualMeetingProvider } from '@integrations/meeting/ManualMeetingProvider';
import { prisma } from '@database/prisma';

const emailProvider = createEmailProvider();
const meetingProvider = new ManualMeetingProvider();

export const eventsService = {
  listUpcoming() {
    return eventsRepository.listUpcoming();
  },

  async getEvent(id: string) {
    const event = await eventsRepository.findById(id);
    if (!event) throw ApiError.notFound('Event not found');
    return event;
  },

  async register(eventId: string, userId: string) {
    const event = await eventsRepository.findById(eventId);
    if (!event) throw ApiError.notFound('Event not found');
    if (event.status === 'CANCELLED') throw ApiError.badRequest('This event has been cancelled');
    if (new Date(event.endTime) < new Date()) throw ApiError.badRequest('This event has already ended');

    const existing = await eventsRepository.findRegistration(eventId, userId);
    if (existing) throw ApiError.conflict('You are already registered for this event');

    if (event.maxAttendees) {
      const count = await eventsRepository.countRegistrations(eventId);
      if (count >= event.maxAttendees) throw ApiError.conflict('This event is full');
    }

    const registration = await eventsRepository.register(eventId, userId);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await emailProvider.send({
        to: user.email,
        subject: `You're registered: ${event.title}`,
        html: `<p>Hi ${user.firstName}, you're registered for ${event.title} on ${event.startTime.toISOString()}.</p>${
          event.meetingUrl ? `<p>Join link: ${event.meetingUrl}</p>` : ''
        }`,
      });
    }

    return registration;
  },

  listMyRegistrations(userId: string) {
    return eventsRepository.listMyRegistrations(userId);
  },

  // ---- Host (mentor/admin) side ----
  listHostedBy(hostId: string) {
    return eventsRepository.listHostedBy(hostId);
  },

  listAll() {
    return eventsRepository.listAll();
  },

  async create(
    hostId: string,
    input: {
      title: string;
      description?: string;
      eventType: string;
      startTime: string;
      endTime: string;
      maxAttendees?: number;
      meetingUrl?: string;
    },
  ) {
    if (new Date(input.endTime) <= new Date(input.startTime)) {
      throw ApiError.badRequest('End time must be after start time');
    }

    // Meeting link goes through the same abstracted MeetingProvider used by
    // mentorship sessions — swap ManualMeetingProvider for a real Zoom/Meet
    // integration later without touching this service.
    const meeting = await meetingProvider.createMeeting({
      title: input.title,
      startTime: new Date(input.startTime),
      durationMins: Math.round((new Date(input.endTime).getTime() - new Date(input.startTime).getTime()) / 60000),
      manualUrl: input.meetingUrl,
    } as any);

    return eventsRepository.create({
      title: input.title,
      description: input.description,
      hostId,
      eventType: input.eventType,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      maxAttendees: input.maxAttendees,
      meetingProvider: meeting.provider,
      meetingUrl: meeting.meetingUrl,
    });
  },

  async cancel(hostId: string, eventId: string, isAdmin: boolean) {
    const event = await eventsRepository.findById(eventId);
    if (!event) throw ApiError.notFound('Event not found');
    if (!isAdmin && event.hostId !== hostId) throw ApiError.forbidden('Not authorized to cancel this event');

    const cancelled = await eventsRepository.cancel(eventId);

    const attendees = await eventsRepository.listAttendees(eventId);
    await Promise.all(
      attendees.map((a) =>
        emailProvider.send({
          to: a.user.email,
          subject: `Cancelled: ${event.title}`,
          html: `<p>Hi ${a.user.firstName}, unfortunately ${event.title} has been cancelled.</p>`,
        }),
      ),
    );

    return cancelled;
  },

  async listAttendees(hostId: string, eventId: string, isAdmin: boolean) {
    const event = await eventsRepository.findById(eventId);
    if (!event) throw ApiError.notFound('Event not found');
    if (!isAdmin && event.hostId !== hostId) throw ApiError.forbidden('Not authorized to view attendees');
    return eventsRepository.listAttendees(eventId);
  },
};
