# Account & Security

This document combines account settings, authentication security and login monitoring.

## Hook and route coverage

- `hooks/use-auth-mutations.ts` implements sign-up, password sign-in and Google OAuth initiation.
- `hooks/useAuth.ts` tracks the Supabase auth session.
- `hooks/client/use-my-account.ts` reads the signed-in account profile and membership summary.
- `lib/functions/save-account-settings.ts` updates name/phone/address and changed notification preferences; the settings form calls `set_my_avatar` for avatar changes. These are component/library operations, not a dedicated React Query mutation hook.
- Auth pages include `/auth/signin`, `/auth/signup`, `/auth/verify-email`, `/auth/forgot-password` and `/auth/update-password`; parent settings are under `/settings`.
- Login monitoring currently has database schema and RPC foundations, but no matching auth API route or React hook was found in the app.

## Member settings

The parent portal's `/settings` route now uses
`components/portals/client/settings/new-settings-form.tsx` and
`hooks/shared/use-my-settings.ts`. Its four tabs are Profile, Notifications,
Security and Your data. This is a broader screen than the legacy
`SettingsForm`; the coach settings route still uses the older settings form.

### Profile

- Edit full name, phone and address; phone numbers are normalized and validated
  using South Africa as the default country when no country code is supplied.
- Upload a JPG, PNG or WEBP avatar up to 2 MB.
- Email is displayed but cannot be changed from the settings screen; users are
  directed to contact TYGA.

### Notifications

- Manage this device's push permission independently through `PushToggle`.
- Choose preferences for session reminders, gear due, payment due, level
  upgrades, parent consultation reminders and announcements.
- The current component keeps these preference switches in local state, but its
  save handler submits only profile fields; it does not persist the preference
  changes. Treat preference persistence as incomplete until the mutation is
  wired to the notification-preference backend.

### Security

- Change a password for password-enabled accounts after verifying the current
  password; the new password must be at least eight characters and differ from
  the current password.
- When the current session needs a higher MFA assurance level, a code from the
  authenticator app is required.
- Manage authenticator-based MFA at `/settings/security`.
- Review active sessions/devices and sign out an individual other device or
  all other devices. Changing a password also signs out other devices.

### Your data

- Download a JSON export via `get_my_data_export`. The UI describes it as
  including profile, children, enrolments and consents.
- Submit an account-deletion request and cancel an open request. Request
  status, handling time and deletion blockers are returned in settings data;
  the UI describes the request as subject to review, not an immediate account
  deletion.

The settings read uses `get_my_settings`; profile updates use
`update_my_settings`, avatar updates use `set_my_avatar`, device revocation
uses `revoke_my_session` / `revoke_my_other_sessions`, and data requests use
`request_account_deletion` / `cancel_my_deletion_request`.

## Legacy account settings

The older `components/portals/client/settings/settings-form.tsx` remains in use
on the coach settings route and documents the narrower legacy surface:

### Features

- Edit full name, phone number and address
- Upload a JPG, PNG or WEBP avatar (2 MB maximum)
- Toggle per-type notification preferences and this-device push permission
- Change a password after entering the current password
- The deactivation control in this legacy form is disabled and directs the user
  to contact TYGA

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

### Legacy key behaviours

- Email is not editable from the settings screen
- Role is not editable from the settings screen
- Password change re-authenticates with the current password and requires a new password of at least eight characters
- Password recovery/update uses Supabase Auth directly from the auth pages
- Settings save profile fields first, then saves changed notification preferences; a later preference failure can therefore occur after profile fields have already been persisted

The older account hook is a read hook (`get_my_account`) and includes role,
active state and membership status/current period end. Keep it separate from
the expanded parent settings data and the privileged admin account directory
described in [administration-and-reporting.md](./administration-and-reporting.md).

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

## Two-factor authentication (implemented)

TYGA enforces TOTP-based MFA for privileged roles and allows parent users to opt in from the security settings page. The MFA status is resolved with `hooks/shared/use-mfa-policy.ts`, which calls `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` and reports one of `verified`, `needs-challenge` or `needs-enrollment`.

### Enforcement and routing

- `proxy.ts` blocks access to protected routes until the user has either satisfied AAL2 or completed the required enrollment/challenge flow.
- `app/admin/layout.tsx`, `app/coach/layout.tsx` and `app/(client)/layout.tsx` use the MFA policy to redirect to `/auth/mfa/enroll` or `/auth/mfa/challenge` while the policy remains unresolved.
- The middleware intentionally skips parents for enrollment enforcement (`MFA is optional for parents`), but still challenges them if they have already enrolled and have not yet verified a fresh code.
- Privileged users who have no factor enrolled are redirected to `/auth/mfa/enroll` before they can continue to the portal.

### User flows

- `/auth/mfa/enroll` is the required enrollment page for `admin` and `coach` roles. It checks the current user, resolves the account role via `get_my_account`, and redirects users who already have a verified TOTP factor away from the page.
- `/auth/mfa/challenge` requires a valid 6-digit TOTP code before returning the user to the intended destination.
- `/settings/security` exposes the management surface for parent accounts. It lists enrolled factors and renders the disable flow via `components/portals/shared/auth/disable-mfa.tsx`.

### Implementation notes

- Enrollment is implemented in `components/portals/shared/enroll-mfa.tsx` and uses Supabase TOTP enrollment (`supabase.auth.mfa.enroll` with `factorType: "totp"`).
- The flow renders the QR code plus a manual secret key, verifies the code with `supabase.auth.mfa.challenge()` and `supabase.auth.mfa.verify()`, then refreshes the session before redirecting.
- `DisableMFA` calls `supabase.auth.mfa.unenroll({ factorId })` and refreshes the page after confirmation.
- The app currently supports TOTP via authenticator apps such as Google Authenticator, Authy, 1Password and other standards-compliant apps. No backup codes or recovery flow are documented in the current UI.

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
- Session management for active devices
