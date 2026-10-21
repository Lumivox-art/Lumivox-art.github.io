# Design

## Context

`MoM-web/src/pages/JozCommissionsPage.tsx` actualmente calcula el costo total en USD y MXN en tiempo real según las selecciones de estilo, tamaño y acabado del cliente. Sin embargo, no captura el medio de contacto del cliente ni ofrece una vía automatizada para enviar la orden al artista Joph (Discord ID: `984706414914187284`).

Ver `proposal.md` para la motivación general y `specs/commission-quote/spec.md` para los requerimientos funcionales.

## Goals / Non-Goals

**Goals:**
- Agregar campos de formulario para el identificador de Discord del cliente y notas/referencias opcionales.
- Habilitar el botón de envío únicamente cuando las selecciones obligatorias (estilo, tamaño, acabado) y el identificador de Discord estén completos.
- Construir un payload compatible con la API de Webhooks de Discord usando un `Embed` con viñetas (*bullet points*) y totales calculados.
- Notificar o referenciar a Joph (`<@984706414914187284>`) en el mensaje del webhook.
- Manejar estados reactivos de envío (`idle`, `submitting`, `success`, `error`) con retroalimentación visual accesible.

**Non-Goals:**
- Procesamiento de pagos (se acuerda directamente entre artista y cliente tras la cotización).
- Subida directa de archivos binarios/imágenes pesadas al webhook (se coordinan mediante enlaces externos o chat posterior).

## Decisions

### 1. Estructura del Payload y Notificación en Discord
- **Decisión**: Estructurar el mensaje con un `embed` enriquecido (color #5865F2, timestamp ISO, campos formateados) y un mensaje principal (`content`) que incluya una mención a Joph (`<@984706414914187284>`) y al usuario de Discord del cliente.
- **Alternativas consideradas**:
  - *Mensaje en texto plano*: Descartado por ser menos legible y desestructurado para el desglose de precios.
  - *Bot interactivo con comandos*: Descartado porque requiere infraestructura de servidor dedicada, mientras que la web actual es estática (GitHub Pages).

### 2. Formato de Viñetas (*Bullet Points*)
- **Decisión**: Transformar cada selección en una línea Markdown `• **Categoría:** Nombre ($Precio USD)` en el campo de descripción o en un campo dedicado `📋 Desglose de la Comisión`.
- **Alternativas consideradas**: Tabla ASCII o texto separado por comas (menos estético y difícil de leer en pantallas móviles de Discord).

### 3. Configuración del Endpoint de Webhook
- **Decisión**: Leer la URL del Webhook desde `import.meta.env.VITE_DISCORD_WEBHOOK_URL` (compatible con Vite). Si no está definida en desarrollo local, simular un retraso y éxito en modo demostración con advertencia en consola.
- **Alternativas consideradas**:
  - *Hardcodear la URL*: Descartado por seguridad para evitar filtrar el webhook token en el repositorio público.

### 4. Estado del Formulario en el Componente
- **Decisión**: Extender el estado reactivo en `JozCommissionsPage.tsx`:
  - `discordUser`: string (obligatorio)
  - `notes`: string (opcional)
  - `isSubmitting`: boolean
  - `submitStatus`: `'idle' | 'success' | 'error'`
  - `errorMessage`: string | null

## Risks / Trade-offs

- **[Riesgo: Exposición de la URL del Webhook en bundle cliente]** → Mitigación: Usar la variable de entorno `VITE_DISCORD_WEBHOOK_URL` y documentar la opción de implementar un microservicio proxy serverless (ej. Cloudflare Worker o Vercel Serverless Function) si se requiere ocultar la URL final y evitar spam.
- **[Riesgo: Fallo de red o respuesta de error de Discord]** → Mitigación: Deshabilitar el botón durante el envío para evitar duplicados; si la petición falla, capturar el error y mostrar un mensaje con opción de reintentar sin perder las selecciones previas.
