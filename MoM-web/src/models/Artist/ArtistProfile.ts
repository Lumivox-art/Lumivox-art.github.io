import type { SocialEntry } from '../../data/artists';

export interface ArtistProfile {
  handle: string;
  displayName: string;
  tagline: string;
  discipline: string;
  bio: string;
  brief?: string;
  accentColor: string;
  socials: SocialEntry[];
  updatedAt: number;
}
