# Security — Login Tracking & Account Lockouts — README

Sign-in activity logging, suspicious-activity flagging, and admin-managed account lockouts.

---

## Features

### Automatic

- **Every sign-in attempt logged** — success, failure, blocked (locked-account attempt), and logout
- **Suspicious activity flagged automatically**:
  - Successful sign-in from an IP the account has never used before
  - 5+ failed attempts for one email within 15 minutes
  - 5+ different accounts targeted from one IP within 15 minutes
- **Automatic short lockout** — 15 minutes, triggered by repeated failed attempts, independent of any admin action

### Admin

- **Lock an account** — reason required, duration selectable (1 hour / 24 hours / 7 days / 30 days / indefinitely)
- **Unlock an account** — lifts the lockout and the underlying Auth ban together
- **Sign-in history** — full log, filterable to suspicious-only, per-account or academy-wide
- **Lockout history** — active and past lockouts, who locked/unlocked, reason, duration

### All users

- **Immediate lockout enforcement** — a locked-in-session user is signed out within ~60 seconds of being locked, not just on their next token refresh

---

## Data model

| Table | What it holds |
|---|---|
| `login_events` | Every sign-in attempt — account, email attempted, event type, IP, user agent, suspicious flag + reason |
| `account_lockouts` | Lock history — reason, source (admin/automatic), locked by/until, lifted by/note |

---

## API Routes (no Edge Functions / CLI required)

| Route | Summary |
|---|---|
| `POST /api/auth/login` | Checks for an active lockout before checking the password; records the attempt either way; triggers an automatic lockout on the 5th failure |
| `POST /api/auth/logout` | Records a logout event, signs out |
| `GET /api/auth/locked` | Signs out a currently-locked user and redirects to `/login` with the reason |
| `POST /api/admin/lock-account` | Admin-only — lock or unlock an account (`action: "lock" | "unlock"`) |

---

## RPCs

| Function | Summary |
|---|---|
| `record_login_event` | Service-role only — inserts the log row, computes suspicion flags, returns whether an auto-lock should fire |
| `get_active_lockout` | Service-role only — used by the login route to check an account by id |
| `get_my_active_lockout` | Caller checks their own current lockout status |
| `admin_get_login_events` | Sign-in history, filterable |
| `admin_get_lockouts` | Lockout history, active-only or all |

---

## Hooks

| File | Exports |
|---|---|
| `hooks/admin/use-security.ts` | `useLoginEvents`, `useLockouts` |
| `hooks/admin/use-lock-account.ts` | `useLockAccount`, `useUnlockAccount` |

---

## Components

| Component | Purpose |
|---|---|
| `LockAccountDialog` | Modal — reason + duration, calls `useLockAccount` |
| `SecurityTabs` | Admin page — Suspicious activity / Sign-in history / Lockouts tabs |
| `LockWatcher` | Mounted in every portal layout — polls `get_my_active_lockout` every 60s, redirects to `/api/auth/locked` if locked |

---

## Pages

| Route | Role | Purpose |
|---|---|---|
| `/admin/security` | Admin | Suspicious activity, sign-in history, lockout management |

---

## Key behaviours

| Rule | Where enforced |
|---|---|
| A locked account is rejected before its password is even checked | `POST /api/auth/login`, lockout check precedes `signInWithPassword` |
| Failed-attempt counting resets after a successful login | `record_login_event`, only counts failures since the last `login_success` |
| An admin can't lock their own account | `POST /api/admin/lock-account`, explicit self-lock guard |
| A new lock supersedes any prior active lock, only after the ban succeeds | `lockAccount()` — insert → ban → supersede old lock, in that order, rolled back on ban failure |
| `record_login_event` and `get_active_lockout` are service-role only | Explicit `revoke ... from public, anon, authenticated` |
| Locked-in-session users are cut off without waiting for token expiry | `LockWatcher` (client-side poll) + `assertNotLocked()` (server-side, on hard page loads) |
| Login event data has a retention limit | `pg_cron` job purges rows older than 90 days |

---

## Setup order

1. `01-login-events-schema.sql`
2. `02-account-lockouts-schema.sql`
3. `03-security-indexes.sql`
4. `04-security-policies.sql`
5. `05-security-rpcs.sql`
6. Add `SUPABASE_SERVICE_ROLE_KEY` (server-only) to environment variables
7. Add `/api/auth/login`, `/api/auth/logout`, `/api/auth/locked`, `/api/admin/lock-account` routes
8. Mount `<LockWatcher />` in each portal layout, call `assertNotLocked()` at the top of each
9. Enable `pg_cron` extension, schedule the login-event purge job
10. `notify pgrst, 'reload schema';`

---

## Not implemented

- Brute-force protection independent of this app's own login route (a caller using the Supabase anon key directly bypasses this tracking entirely — mitigated by enabling Supabase Auth's built-in rate limiting + CAPTCHA separately)
- CAPTCHA on repeated failures
- Self-service "recent sign-ins" view for a non-admin user (RLS policy exists, no UI)
- Geo-IP lookup / location display for sign-in events (IP is logged, not resolved to a location)
- Shortened JWT expiry to fully close the "already-issued token" window