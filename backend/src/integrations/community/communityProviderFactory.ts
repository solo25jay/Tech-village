import type { CommunityProvider } from './CommunityProvider';
import { StaticCommunityProvider } from './StaticCommunityProvider';

export function createCommunityProvider(): CommunityProvider {
  return new StaticCommunityProvider();
}
