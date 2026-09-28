import { api } from './api';

export type EventType = 'webinar' | 'live_class' | 'workshop' | 'group_mentorship' | 'orientation';

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startTime: string;
  endTime: string;
  maxAttendees: number | null;
  meetingProvider: string | null;
  meetingUrl: string | null;
  status: string;
  hostId: string | null;
  _count: { registrations: number };
}

export interface EventRegistration {
  id: string;
  eventId: string;
  registeredAt: string;
  attended: boolean;
  event: EventItem;
}

export const eventsApi = {
  listUpcoming: () => api.get<{ data: EventItem[] }>('/events'),
  getEvent: (eventId: string) => api.get<{ data: EventItem }>(`/events/${eventId}`),
  register: (eventId: string) => api.post(`/events/${eventId}/register`),
  myRegistrations: () => api.get<{ data: EventRegistration[] }>('/events/mine'),
};

export const hostEventsApi = {
  listMine: () => api.get<{ data: EventItem[] }>('/host/events'),
  create: (input: {
    title: string;
    description?: string;
    eventType: EventType;
    startTime: string;
    endTime: string;
    maxAttendees?: number;
    meetingUrl?: string;
  }) => api.post('/host/events', input),
  cancel: (eventId: string) => api.patch(`/host/events/${eventId}/cancel`),
  attendees: (eventId: string) => api.get(`/host/events/${eventId}/attendees`),
};
