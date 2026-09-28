import type { CreateMeetingInput, CreateMeetingResult, MeetingProvider } from './MeetingProvider';

/**
 * MVP default: the mentor/admin pastes a Zoom/Meet/Teams link they created
 * themselves, and Tech Village just stores + manages it. This satisfies
 * "do not build video conferencing" without requiring live API keys before
 * Phase 3. Swap for a real ZoomMeetingProvider / GoogleMeetProvider later
 * via meetingProviderFactory — nothing else in the codebase changes.
 */
export class ManualMeetingProvider implements MeetingProvider {
  async createMeeting(input: CreateMeetingInput & { manualUrl?: string }): Promise<CreateMeetingResult> {
    return {
      provider: 'manual',
      meetingUrl: input.manualUrl ?? '',
    };
  }
}
