# Tasks

## 1. Localization & Payload Utilities

- [x] 1.1 Add i18n localization keys in `MoM-web/src/i18n.tsx` for Discord input, optional notes, submit action, in-flight loading text, success notice, and error messages. Verify dictionary types and text render in Spanish and English.
- [x] 1.2 Implement payload builder function `buildDiscordCommissionPayload` that generates the Discord Webhook JSON with embed bullet points (`• Category: Name ($Price USD)`), total calculation, client Discord ID, and reference to artist Joph (`984706414914187284`). Verify the generated JSON matches Discord embed schema.

## 2. Component State & Form UI

- [x] 2.1 Extend `JozCommissionsPage.tsx` state with `discordUser`, `notes`, and submission status (`idle`, `submitting`, `success`, `error`), rendering input fields below the summary section. Verify state updates on user input.
- [x] 2.2 Add the submission button below the inputs with disabled logic when any mandatory selection (style, size, look) or Discord handle is empty. Verify button enables only when all required selections are present.
- [x] 2.3 Style new form elements, submit button, and feedback alerts in `MoM-web/src/pages/JozCommissions.scss` adhering to the existing theme variables. Verify visual layout in dark and light themes.

## 3. Webhook Integration & Verification

- [x] 3.1 Connect form submission to `VITE_DISCORD_WEBHOOK_URL` via `fetch` POST, disabling controls while in-flight, showing a success message on HTTP 200/204, and displaying an error banner with retry option on failure. Verify end-to-end submission flow.
- [x] 3.2 Run `npm run build` in `MoM-web` to verify TypeScript compile checks and Vite asset bundling succeed without errors.

## Workflow follow-up

- Archive the change after implementation and validation are complete (`/opsx-archive`).
