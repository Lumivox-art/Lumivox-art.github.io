import { useState } from 'react';
import type { SocialEntry, SocialPlatform } from '../../../data/artists';
import { useLang } from '../../../i18n';

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  twitter: 'Twitter',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  twitch: 'Twitch',
  behance: 'Behance',
  artstation: 'ArtStation',
  bandcamp: 'Bandcamp',
  spotify: 'Spotify',
  linkedin: 'LinkedIn',
  discord: 'Discord',
  github: 'GitHub',
  other: 'Link',
};

type SocialsModuleProps = {
  entries: SocialEntry[];
};

export function SocialsModule({ entries }: SocialsModuleProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { t } = useLang();

  if (entries.length === 0) return null;

  const handleCopyDiscord = (entry: SocialEntry) => {
    if (entry.platform === 'discord' && entry.label?.includes('@')) {
      const match = entry.label.match(/@[a-zA-Z0-9_.]+/);
      const textToCopy = match ? match[0] : entry.label;
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy);
        setCopiedKey(entry.platform);
        setTimeout(() => setCopiedKey(null), 2000);
      }
    }
  };

  return (
    <div className="lumivox-socials" role="list">
      {entries.map((entry) => {
        const defaultLabel = entry.label ?? PLATFORM_LABELS[entry.platform];
        const isCopied = copiedKey === entry.platform;
        const displayLabel = isCopied
          ? `✓ ${t('specku.discord.copied.copied') || 'Copiado!'}`
          : defaultLabel;

        return (
          <a
            key={`${entry.platform}-${entry.url}`}
            className="lumivox-social"
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            onClick={() => handleCopyDiscord(entry)}
            title={entry.platform === 'discord' ? entry.label : undefined}
          >
            {entry.platform === 'discord' && (
              <svg
                className="lumivox-discord-icon"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            )}
            {entry.platform === 'youtube' && (
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            )}
            <span>{displayLabel}</span>
            <span className="lumivox-social-arrow" aria-hidden="true">
              {isCopied ? '✓' : '↗'}
            </span>
          </a>
        );
      })}
    </div>
  );
}
