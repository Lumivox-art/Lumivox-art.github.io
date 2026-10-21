# Proposal

## Why

Reemplazar el flujo manual donde el cliente debe copiar texto y buscar al artista en Discord. Con el envío directo por Webhook, el artista recibe solicitudes estandarizadas con el desglose exacto y el precio calculado en un canal privado, mientras le proporciona un medio de contacto directo (el usuario o ID de Discord del cliente) para iniciar el seguimiento inmediato.

## What Changes

- Incorporar un campo de entrada obligatorio para el usuario o ID numérico de Discord del cliente en la página de cotización de comisiones de Joz/Joph (`JozCommissionsPage`).
- Incorporar un campo opcional para notas y referencias adicionales del cliente.
- Agregar un botón de envío que se habilita únicamente cuando todas las opciones requeridas (estilo, tamaño, acabado) y el identificador de Discord han sido completados.
- Formatear automáticamente el desglose de la cotización en una lista con viñetas (*bullet points*) Markdown (`• Categoría: Opción ($Precio USD)`) junto con el total calculado y el enlace o mención al perfil de Discord de Joph (`984706414914187284`).
- Implementar la función de envío HTTP `POST` hacia el Webhook de Discord estructurado como un `Embed` con estados visuales de carga (*loading*), confirmación de éxito y manejo de errores.

## Capabilities

### New Capabilities
- `commission-quote`: Captures commission options, calculates total price, validates client Discord identity, and submits structured order summaries via Discord Webhook.

### Modified Capabilities
<!-- None -->

## Impact

- Frontend: `MoM-web/src/pages/JozCommissionsPage.tsx` y `MoM-web/src/pages/JozCommissions.scss`.
- Localización: Nuevas claves para etiquetas, placeholders y mensajes de estado en `MoM-web/src/i18n.tsx`.
- Configuración de entorno: Variable de entorno para la URL del webhook (`VITE_DISCORD_WEBHOOK_URL`).
- APIs externas: Petición HTTP POST hacia Discord Webhooks API.
