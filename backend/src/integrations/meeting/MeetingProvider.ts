export interface CreateMeetingInput {
  title: string;
  startTime: Date;
  durationMins: number;
}

export interface CreateMeetingResult {
  provider: 'zoom' | 'google_meet' | 'teams' | 'manual';
  meetingUrl: string;
  meetingId?: string;
}

/**
 * Tech Village never hosts video calls itself. This interface is the only
 * thing the Events and Mentorship modules depend on — the concrete
 * implementation (Zoom API, Google Calendar API, Teams Graph API, or a
 * manual link entered by an admin) is swapped in a factory, same pattern
 * as EmailProvider.
 */
export interface MeetingProvider {
  createMeeting(input: CreateMeetingInput): Promise<CreateMeetingResult>;
}
