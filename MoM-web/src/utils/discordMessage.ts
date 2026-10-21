export const JOPH_DISCORD_ID = '984706414914187284';
export const JOPH_DISCORD_PROFILE_URL = `https://discord.com/users/${JOPH_DISCORD_ID}`;

export interface CommissionSelection {
  category: string;
  label: string;
  price: number;
}

export interface BuildDiscordMessageOptions {
  greeting: string;
  items: CommissionSelection[];
  totalUsd: number;
  totalMxn: number;
}

/**
 * Builds the plain-text formatted message for Joph's Discord DM.
 */
export function buildDiscordCommissionMessage({
  greeting,
  items,
  totalUsd,
  totalMxn,
}: BuildDiscordMessageOptions): string {
  const lines = [
    greeting,
    '',
    ...items.map((item) => `• ${item.category}: ${item.label} ($${item.price} USD)`),
    '',
    `💰 Total: $${totalUsd} USD (~$${totalMxn} MXN)`,
  ];
  return lines.join('\n');
}
