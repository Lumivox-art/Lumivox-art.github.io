export const JOPH_DISCORD_ID = '984706414914187284';

export interface CommissionItem {
  category: string;
  label: string;
  price: number;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields: DiscordEmbedField[];
  timestamp: string;
  footer?: { text: string };
}

export interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content: string;
  embeds: DiscordEmbed[];
}

export interface BuildDiscordPayloadOptions {
  discordUser: string;
  notes?: string;
  items: CommissionItem[];
  totalUsd: number;
  totalMxn: number;
}

/**
 * Builds the structured Discord webhook payload for artist Joph.
 */
export function buildDiscordCommissionPayload({
  discordUser,
  notes = '',
  items,
  totalUsd,
  totalMxn,
}: BuildDiscordPayloadOptions): DiscordWebhookPayload {
  const bulletPoints =
    items.length > 0
      ? items.map((item) => `• **${item.category}:** ${item.label} ($${item.price} USD)`).join('\n')
      : '• Ninguna selección';

  const cleanedUser = discordUser.trim();
  const isNumericId = /^\d{17,20}$/.test(cleanedUser);
  const userDisplay = isNumericId
    ? `<@${cleanedUser}> (\`${cleanedUser}\` - [Ver perfil](https://discord.com/users/${cleanedUser}))`
    : `\`${cleanedUser}\``;

  return {
    username: 'Joph Commission Bot',
    content: `🎨 **Nueva solicitud de comisión para <@${JOPH_DISCORD_ID}>** de ${userDisplay}`,
    embeds: [
      {
        title: '✨ Resumen de Cotización de Comisión',
        color: 0x5865f2, // Blurple
        fields: [
          {
            name: '👤 Perfil de Discord del Cliente',
            value: userDisplay,
            inline: false,
          },
          {
            name: '📋 Selecciones Realizadas',
            value: bulletPoints,
            inline: false,
          },
          {
            name: '📝 Notas / Referencias',
            value: notes.trim() !== '' ? notes.trim() : '*Sin notas adicionales*',
            inline: false,
          },
          {
            name: '💰 Total Estimado',
            value: `**$${totalUsd} USD** (~$${totalMxn} MXN)`,
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: `Lumivox Commission System · Artista ID: ${JOPH_DISCORD_ID}`,
        },
      },
    ],
  };
}

/**
 * Sends the payload to the Discord Webhook URL.
 */
export async function sendDiscordCommissionQuote(
  webhookUrl: string | undefined,
  payload: DiscordWebhookPayload
): Promise<void> {
  if (!webhookUrl || webhookUrl.trim() === '') {
    // If no webhook URL is configured in local development, simulate sending
    console.warn(
      '[Discord Webhook] VITE_DISCORD_WEBHOOK_URL is not set. Simulating successful dispatch:',
      payload
    );
    await new Promise((resolve) => setTimeout(resolve, 600));
    return;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Discord Webhook responded with status ${response.status}: ${errorText || response.statusText}`
    );
  }
}
