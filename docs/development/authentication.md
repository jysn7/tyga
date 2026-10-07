# Authentication and onboarding

TYGA uses Supabase Auth for identity and an `accounts` row for application profile and role data. The supported roles are `parent`, `coach` and `admin`.

## Client and server clients

Use the project helpers rather than constructing Supabase clients ad hoc:

- `utils/supabase/client.ts` creates the browser client.
- `utils/supabase/server.ts` creates the server-side client.
- `utils/supabase/middleware.ts` contains the Supabase session/middleware integration.
- `utils/supabase/admin.ts` creates a privileged service-role client for trusted server code only.

The browser and request-scoped clients use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The service-role key bypasses Row Level Security; it must never be exposed to browser code.

## Sign-in, sign-up and callback

The authentication pages live under `app/auth/`. Sign-in and registration use Supabase Auth. New public registrations are assigned the parent role by the database onboarding trigger rather than by trusting a role supplied by the client.

OAuth/email confirmation callbacks use `app/auth/callback/route.ts`. The callback exchanges the Supabase authorization code for a session and redirects to `/dashboard?toast=auth-success`. Configure the matching site and redirect URLs in Supabase Auth settings for each environment.

Password recovery uses Supabase's reset-email and update-user flows. Check the current auth pages and their callers before changing redirect behavior.

## Role resolution and route protection

`hooks/useAuth.ts` reads the signed-in session and resolves the application role with the `get_my_account` RPC. Its options are:

| Option | Purpose |
| --- | --- |
| `redirectTo` | Redirect destination when there is no session; defaults to `/auth/signin`. |
| `redirectIfAuthenticated` | Sends an already signed-in user away from an auth page to their role's home. |
| `requiredRole` | Redirects a signed-in user to their own portal if their resolved role does not match. |

Role destinations are `/dashboard` for parents, `/coach/overview` for coaches and `/admin/overview` for admins.

The hook and portal layouts provide client-side navigation and UX. They are not a substitute for authorization: database access must remain protected by RLS and privileged server operations must validate the caller before using the service-role client.

## Environment variables

Create `.env.local` in the repository root. Do not commit it or place private keys in `NEXT_PUBLIC_` variables.

| Variable | Use |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL; required by the app. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon client key; required by the app. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged access used by selected API handlers. |
| `NEXT_PUBLIC_SITE_URL` | Public app URL used when constructing invite and payment redirects. |
| `PAYSTACK_SECRET_KEY` | Server-only Paystack checkout and webhook verification. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional browser key used by the venue address/map picker. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push application-server public key. |
| `VAPID_PRIVATE_KEY` | Server-only Web Push private key. |
| `VAPID_SUBJECT` | Web Push contact URI, commonly a `mailto:` URI. |
| `NOTIFICATION_WEBHOOK_SECRET` | Secret used to authenticate the push-send API route. |

The older `utils/push-setup.ts` helper also reads `NEXT_PUBLIC_VAPID_KEY`; the current push subscription flow and push-send route use `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Prefer the latter for the current flow and check all call sites before removing the legacy helper or variable.

Only configure integration keys for services enabled in the environment. Use provider test credentials locally and ensure production secrets are stored in the hosting environment's secret manager.

## Database and account security

The `accounts` table stores application roles/profile data linked to Supabase Auth users. Database migrations define the onboarding trigger, role-aware RPCs and RLS policies. Apply migrations from `supabase/migrations/` through the project's Supabase workflow before relying on a new database feature.

Current feature documentation describes login monitoring, lockouts, sensitive-data access logging, and account administration in [account and security](../features/account-and-security.md) and [administration and reporting](../features/administration-and-reporting.md). Those guides distinguish database support from UI coverage.

## Troubleshooting

- **Invalid Supabase URL/key:** verify the two required public variables and restart the dev server after editing `.env.local`.
- **OAuth or confirmation redirect fails:** check the Supabase Auth site URL, allowed redirect URLs, and the app's callback route.
- **Role lookup returns no role:** verify the user's `accounts` row and the `get_my_account` RPC/migrations.
- **Privileged API request fails:** verify server-side secrets are configured and the route authorizes the caller before using them.
- **Push subscription cannot be created:** confirm browser support, notification permission, service-worker readiness and the VAPID public key. Push sending additionally requires the server-side VAPID values.

For provider-specific guidance, see the [Supabase Auth documentation](https://supabase.com/docs/guides/auth).
