export type SocialPlatform =
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitch'
  | 'behance'
  | 'artstation'
  | 'bandcamp'
  | 'spotify'
  | 'linkedin'
  | 'discord'
  | 'github'
  | 'other';

export type SocialEntry = {
  platform: SocialPlatform;
  url: string;
  label?: string;
  hidden?: boolean;
};

export type BaseArtistModule = { hidden?: boolean };
export type ArtistModule = BaseArtistModule & (
  | { kind: 'brief'; body: string }
  | { kind: 'socials'; entries: SocialEntry[] }
  | { kind: 'website'; url: string; label?: string }
  | { kind: 'portal'; label: string; route: string }
  | { kind: 'email'; address: string; label?: string }
);

export type Artist = {
  handle: string;
  displayName: string;
  tagline: string;
  discipline: string;
  bio: string;
  splash?: string | null;
  icon?: string | null;
  accentColor: string;
  modules: ArtistModule[];
  hidden?: boolean;
};

export const artists: Artist[] = [
  {
    handle: 'luis-m',
    displayName: 'Nix',
    // i18n keys (see i18n.tsx → artist.luis.*); rendered through t()
    tagline: 'artist.luis.hook',
    discipline: 'artist.luis.discipline',
    bio: 'artist.luis.bio',
    splash: null,
    icon: null,
    accentColor: '#3B5673',
    modules: [
      {
        kind: 'brief',
        body: 'artist.luis.brief',
      },
      {
        kind: 'socials',
        hidden: true,
        // TODO confirm with Luis.M — placeholders
        entries: [
          { platform: 'github', url: 'https://github.com/LuisMiguelMedina' },
        ],
      },
      {
        kind: 'website',
        url: 'https://discord.com/users/322903795908739074',
        label: 'Discord',
      },
      {
        kind: 'email',
        hidden: true,
        address: 'luis.mm91836@gmail.com',
      },
    ],
  },
  {
    handle: 'specku',
    displayName: 'Specku',
    tagline: 'artist.specku.hook',
    discipline: 'artist.specku.discipline',
    bio: 'artist.specku.bio',
    splash: null,
    icon: null,
    accentColor: '#D17865',
    modules: [
      {
        kind: 'brief',
        body: 'artist.specku.brief',
      },
      {
        kind: 'socials',
        hidden: true,
        // TODO confirm with Specku — placeholders
        entries: [
          { platform: 'twitter', url: 'https://twitter.com/specku' },
          { platform: 'instagram', url: 'https://instagram.com/specku' },
        ],
      },
      // TODO confirm with Specku — placeholder website URL
      { kind: 'website', hidden: true, url: 'https://specku.example', label: 'Portfolio' },
      {
        kind: 'portal',
        label: 'cta.commissions',
        route: '/home/specku/comisiones',
      },
    ],
  },
  {
    handle: 'sunlight-blue',
    displayName: 'Sunlight Blue',
    tagline: 'artist.sunlight.hook',
    discipline: 'artist.sunlight.discipline',
    bio: 'artist.sunlight.bio',
    splash: null,
    icon: null,
    accentColor: '#3A63A8',
    modules: [
      {
        kind: 'brief',
        body: 'artist.sunlight.brief',
      },
      {
        kind: 'socials',
        entries: [
          {
            platform: 'youtube',
            url: 'https://www.youtube.com/@SunlightBlueYT',
            label: 'YouTube',
          },
          {
            platform: 'discord',
            url: 'https://discord.com',
            label: 'Discord: @sunlight_blue',
          },
        ],
      },
      {
        kind: 'portal',
        label: 'cta.commissions',
        route: '/home/sunlight-blue/comisiones',
      },
    ],
  },
  {
    handle: 'sam',
    hidden: true,
    // TODO confirm with Sam — placeholder
    displayName: 'Sam',
    tagline: 'Lorem ipsum dolor sit amet, consectetur adipiscing',
    discipline: 'Lorem Ipsum · Dolor Sit',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
    splash: null,
    icon: null,
    accentColor: '#6FA8AB',
    modules: [
      {
        kind: 'brief',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
      },
      {
        kind: 'socials',
        // TODO confirm with Sam — placeholders
        entries: [
          { platform: 'instagram', url: 'https://instagram.com/sam' },
          { platform: 'twitter', url: 'https://twitter.com/sam' },
        ],
      },
      {
        kind: 'portal',
        label: 'cta.commissions',
        route: '/home/sam/comisiones',
      },
    ],
  },
];
