# Notifications & PWA — README

In-app notifications, Web Push, and installability.

---

## Features

### All users

- **In-app notifications** — reminders, payment alerts, level-ups, appointment updates
- **Mark read / mark all read**
- **Per-type, per-channel preferences** — toggle session reminders, payment due, level upgrades, parent-consultation reminders, announcements on/off
- **Installable app** — "Add to Home Screen" on Android/desktop, manual install on iOS Safari
- **Web Push** — real push notifications delivered even when the app isn't open, once enabled

---

## Data model

| Table | What it holds |
|---|---|
| `notifications` | Recipient (`account_id`), related object, channel, title, body, status |
| `notification_preferences` | Per-account, per-type, per-channel enabled flag |
| `push_subscriptions` | Browser push endpoint + keys per account, from the Push API subscription |

---

## Edge Functions / API Routes

| Function | Summary |
|---|---|
| `send-push` | Looks up an account's subscriptions, sends a Web Push payload to each via `web-push` |

---

## Hooks

| File | Exports |
|---|---|
| `hooks/notifications/use-notifications.ts` | `useNotifications`, `useMarkNotificationRead`, `useMarkAllRead` |
| `hooks/notifications/use-notification-preferences.ts` | `useNotificationPreferences`, `useUpdatePreference` |

---

## Pages

| Route | Role | Purpose |
|---|---|---|
| `/notifications` | All | Notification list |
| `/settings` | All | Notification preferences (part of the settings form) |

---

## Key behaviours

| Rule | Where enforced |
|---|---|
| Service worker is only active in production builds | `disable: process.env.NODE_ENV === "development"` in the PWA config |
| Push delivery requires no third-party account | Self-generated VAPID keys, no Firebase/OneSignal |
| A notification is displayed even when the app is closed | `push` event listener in the service worker |
| iOS push requires the app to be installed first, not just visited | Platform limitation, not a bug — Safari restriction |

---

## Setup order

1. Install `@serwist/next` (Turbopack-compatible; `next-pwa` does not support Turbopack)
2. `sw/sw.ts` — service worker source, including the `push` event listener
3. `next.config.ts` — wrap with `withSerwist`
4. `public/manifest.json` + icons (192, 512, apple-touch-icon)
5. `metadata`/`viewport` exports in the root layout
6. `01-notifications-schema.sql`
7. `02-push-subscriptions-schema.sql`
8. Generate VAPID keys (`npx web-push generate-vapid-keys`), store as env vars
9. Deploy `send-push`
10. `.gitignore`: `public/sw.js`, `public/workbox-*.js`

---

## Not implemented

- WhatsApp / SMS notification channels
- Automated reminder scheduling (session reminders, invoice overdue) — `pg_cron` available, jobs not yet configured
- Push notification click-through deep-linking to the relevant page
- Notification digest / batching (each event currently sends its own push)