# Account & Security

This document combines account settings, authentication security and login monitoring.

## Hook and route coverage

- `hooks/use-auth-mutations.ts` implements sign-up, password sign-in and Google OAuth initiation.
- `hooks/useAuth.ts` tracks the Supabase auth session.
- `hooks/client/use-my-account.ts` reads the signed-in account profile and membership summary.
- `lib/functions/save-account-settings.ts` updates name/phone/address and changed notification preferences; the settings form calls `set_my_avatar` for avatar changes. These are component/library operations, not a dedicated React Query mutation hook.
- Auth pages include `/auth/signin`, `/auth/signup`, `/auth/verify-email`, `/auth/forgot-password` and `/auth/update-password`; parent settings are under `/settings`.
- Login monitoring currently has database schema and RPC foundations, but no matching auth API route or React hook was found in the app.

## Account settings

### Features

- Edit profile information such as full name, phone number and address
- Upload a JPG, PNG or WEBP avatar (2 MB maximum)
- Toggle per-type notification preferences and this-device push permission
- Change a password after entering the current password
- Request account deactivation; the visible deactivation button is currently disabled and directs the user to contact TYGA

### Data model

| Table | Purpose |
|---|---|
| `accounts` | Profile fields, avatar URL and account metadata |
| `notification_preferences` | Channel and type preferences per user |
| `push_subscriptions` | Device-specific push endpoints |
| `auth.users` | Source of truth for credentials |

### RPCs

- `get_my_account`
- `update_my_account`
- `set_my_avatar`
- `set_notification_preference`

### Key behaviours

- Email is not editable from the settings screen
- Role is not editable from the settings screen
- Password change re-authenticates with the current password and requires a new password of at least eight characters
- Password recovery/update uses Supabase Auth directly from the auth pages
- Settings save profile fields first, then saves changed notification preferences; a later preference failure can therefore occur after profile fields have already been persisted

The current account hook is a read hook (`get_my_account`) and includes role, active state and membership status/current period end. Keep it separate from the privileged admin account directory described in [administration-and-reporting.md](./administration-and-reporting.md).

## Login tracking & lockouts: database foundation

The current migration adds login-event and lockout tables, RLS policies and read/record functions. It does not, by itself, wire these functions into the sign-in flow or create lockout rows automatically.

The `record_login_event` service-role function can flag a new IP on a successful login, repeated failed sign-ins, or multiple account names targeted from one IP. It returns a `should_lock` signal after five failures within 15 minutes; the function does not itself insert an `account_lockouts` row. The lockout table supports automatic/admin sources and optional expiry, but no lock/unlock mutation or auth-route integration was found in the current app.

### Data model

| Table | Purpose |
|---|---|
| `login_events` | Every sign-in attempt and result |
| `account_lockouts` | Lock history with reason, source and expiry |

### Routes

No login-tracking API routes or lockout-management pages were found in the current `app/` tree. Existing sign-in is through the Supabase Auth client hook and `/auth/signin`.

### RPCs

- `record_login_event`
- `get_active_lockout`
- `get_my_active_lockout`
- `admin_get_login_events`
- `admin_get_lockouts`

### Function access and integration gap

- `get_active_lockout` and `record_login_event` are service-role only.
- `get_my_active_lockout` is granted to authenticated users for their own account; the migration comments describe intended layout-guard usage, but no matching call site was found.
- `admin_get_login_events` and `admin_get_lockouts` assert admin access and provide read-only history.
- No current app path records sign-in/logout events, applies the returned lock signal, creates/lifts lockout rows, logs out an active locked session, or schedules login-event retention cleanup. Treat those as integration work, not shipped end-to-end behavior.

## Setup order

The migration history is authoritative for the current database primitives. To deliver end-to-end login security, server-side sign-in integration, lockout creation/lifting, UI/read surfaces and a retention job still need to be implemented and verified. Keep service-role access server-side.

## Not implemented

- Sign-in event collection wired to the active sign-in flow
- Applying automatic locks and providing admin lock/unlock mutations
- Active-session lock watcher and an admin history UI
- Login-event retention job
- CAPTCHA on repeated failed attempts
- Location lookup for sign-in IPs
- Self-service recent sign-in view for end users
- Two-factor authentication
- Session management for active devices
