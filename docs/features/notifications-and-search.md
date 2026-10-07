# Notifications, Search & PWA

This document covers the app's discovery and communication layer: notifications, web push, installability and global search.

## Notifications & PWA

### Features

- In-app notification inbox for application-generated activity
- Filter notifications by read state and type group; search the loaded inbox
- Mark one/all notifications read and delete a notification
- Per-type and per-channel preference controls in portal settings
- Installable app experience using the browser's add-to-home-screen flow
- Web push notifications that fire even when the app is closed

### Data model

| Table | Purpose |
|---|---|
| `notifications` | Recipient, notification type, title/body, related entity, read state and timestamp |
| `notification_preferences` | Per-account, per-type and per-channel preference flags |
| `push_subscriptions` | Browser push endpoints and keys for a given device |

### API / edge functions

- `POST /api/notifications/send-push` looks up the relevant subscriptions and sends a push payload via `web-push`
- Expired push endpoints (HTTP 410) are removed from `push_subscriptions`

### Hooks and UI

- `hooks/use-notifications.ts` provides a paginated, filtered inbox query, unread-count query (refreshed every five minutes), mark-read, mark-all-read and delete mutations.
- Read/delete mutations optimistically update cached notification lists and unread count, restore their snapshot on error, and invalidate both query families when settled.
- Notification preferences are fetched from `get_my_notification_preferences` in the client and coach settings pages; preference controls are component/page-level rather than a dedicated hook.
- Client and coach portals have a notifications page. The delivery endpoint is a separate API route.

### Key rules

- Service worker is disabled in development builds
- Push delivery is self-hosted with VAPID keys; no Firebase or OneSignal dependency is required
- Push messages can be delivered while the app is closed; the in-app inbox is read when a portal page is open
- Safari iOS push still requires the app to be installed before it can receive pushes

## Global search

### Features

- Header search dropdown with debounced results
- Role-scoped results based on the signed-in portal
- Advanced search page that reads the `?q=` query string
- "See all results" link that carries the query into the full results view

### Data model

No new tables are required. Search reads directly from `members`, `programmes`, `accounts` and coach-related records via `ILIKE`.

### RPCs

- `parent_global_search`
- `coach_global_search`
- `admin_global_search`

### Key rules

- Search begins after a 300ms debounce
- The query only runs when at least 2 characters are present
- Dropdown results are grouped before render rather than client-filtered again
- Coach results are restricted to programmes they are assigned to
- The hook accepts a role and calls the corresponding `parent_global_search`, `coach_global_search` or `admin_global_search` RPC; each backend RPC defines its permitted result scope
- `hooks/use-global-search.ts` returns role-scoped results with type, title, subtitle and destination URL; its default result limit is five

## Installability and delivery notes

- Service worker behavior is handled outside the React Query hooks; it is disabled in development builds.
- Push uses VAPID configuration and `web-push`; no Firebase or OneSignal dependency is required.
- On iOS Safari, web push requires the site to be installed as a web app.
- The notification inbox is distinct from push delivery: an inbox record can be visible without asserting that a push was successfully delivered.

## Setup

1. Configure the PWA runtime, service worker, manifest, icons and metadata
2. Apply the notification and push-subscription migrations
3. Generate VAPID keys and store them in server/client environment variables as required
4. Deploy the `/api/notifications/send-push` route
5. Reload PostgREST after notification RPC changes

## Not implemented

- WhatsApp or SMS channels
- Automated reminder scheduling
- Click-through deep links for push notifications
- Notification digest batching
- Full-text search relevance ranking or typo-tolerance
