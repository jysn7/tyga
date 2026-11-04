# Administration & Reporting

This document groups cross-cutting admin capabilities that do not belong to a single domain feature. It complements the domain-specific event, venue, programme, appointment, curriculum, billing and member documents.

## Admin overview and reports

The admin overview page currently renders:

- Account, active-member, active-coach and current-month revenue summary tiles
- Enrollment trend over the last six months
- Member count by level
- Recent activity
- Quick links to account, member, coach and audit surfaces

`hooks/admin/use-admin-overview.ts` also exposes reporting queries for revenue by month and programme type, attendance by programme, revenue by period, progression summary, capacity utilization and member attendance. The presence of these hooks does not imply a dedicated report page for every metric; only overview sections consumed by a route are currently a shipped UI.

## Account directory

The `/admin/accounts` page uses `hooks/admin/accounts/use-admin-accounts.ts` to list accounts with role, active-state and search filters, 100-row pages, and a detail panel. Detail includes sign-in/provider and MFA information, child and coach summaries, membership/open-invoice summaries, account history and blockers for anonymization.

The detail panel supports role and active-state changes with an audit reason, password-reset email, admin removal of an authenticator with a reason, and account anonymization with confirmation email and reason. Successful changes refresh the account query family. These are privileged administrative actions; their RPC/server-side authorization remains authoritative. The separate `hooks/admin/use-accounts.ts` hook is a lightweight account picker used by coach creation, not the full account-management surface.

## Coach administration and invitations

Admins can search/filter coaches by active state and manage coach type and maximum student ratio. The coach surface supports two onboarding paths:

1. Promote an existing parent account to coach and create the corresponding coach record.
2. Invite a coach by email, optionally specifying coach type and ratio; inspect invites by status and revoke a pending invite.

Invitation sending is performed by `POST /api/admin/invite-coach`; invite list/revoke and coach list/update use Supabase RPCs. Query caches for coach and invite lists are invalidated after their mutations.

Coach types are `head_coach`, `assistant_coach` and `volunteer`. The coach record can link to its account and optionally to a member.

## Audit log

The admin audit hook reads insert/update/delete events with actor identity/role, table and record IDs, changed fields, before/after data and timestamp. It supports table and actor filters plus pagination (default page size 50). The admin overview links to `/admin/audit`.

Sensitive member access has its own gated flow, documented in [members-and-onboarding.md](./members-and-onboarding.md); do not assume that every sensitive-data read is represented by the general audit-log query.

## Application settings

`hooks/lookups/use-academy-settings.ts` provides `useAppSettings` and `useUpdateAppSettings`. `/admin/settings` exposes four tabs—Academy, Site, Notifications and Payments—and the singleton `app_settings` row covers:

- Appointment behavior: lead time, lookahead, slot length, cancellation cutoff, default ratio and timezone
- Branding/contact: site name/tagline, logo/favicon URLs, primary color, support and WhatsApp contacts, terms/privacy URLs and consent version
- Notification delivery toggles and sender/reply-to details
- Payment/invoice configuration: currency, VAT settings, invoice prefix/due days and bank details

Settings are updated through `admin_update_app_settings`; successful changes invalidate the app-settings query. Convenience accessors expose booking, branding and payment values with defaults while settings are not yet loaded.

## System health and exports

The system health surface uses `hooks/admin/use-ops.ts` to read admin health checks and job results through `admin_get_system_health`; the UI can refresh this data. The same module exports CSV data for members, enrolments, attendance or payments through `admin_export`, with optional date bounds. Export files are named with the selected export kind and the current South African date. CSV cells are escaped, and values beginning with spreadsheet formula characters are prefixed to avoid being interpreted as formulas.

## Hook and route map

| Source | Capability |
|---|---|
| `hooks/admin/use-admin-overview.ts` | Dashboard summary, trends and report queries |
| `hooks/admin/accounts/use-admin-accounts.ts` | Filtered account directory, account detail and privileged account actions |
| `hooks/admin/use-accounts.ts` | Lightweight account picker for coach creation |
| `hooks/admin/use-coaches.ts`, `hooks/admin/use-create-coach.ts`, `hooks/admin/use-update-coach.ts` | Coach list, promotion and profile type/ratio updates |
| `hooks/admin/invites/use-invite-coach.ts`, `hooks/admin/invites/use-coach-invites.ts` | Invite, status-filtered invite list and revoke |
| `hooks/admin/use-audit-log.ts` | Filtered/paginated audit events |
| `hooks/lookups/use-academy-settings.ts` | Read/update global app settings and derive settings groups |
| `hooks/admin/use-ops.ts` | System health queries and CSV exports |
| `/admin/overview`, `/admin/accounts`, `/admin/coaches`, `/admin/audit`, `/admin/settings`, `/admin/finance` | Admin overview, account/coach management, audit and finance/settings pages |

## Boundaries

- Domain-specific CRUD behavior, validation and lifecycle constraints are documented with the owning feature.
- This document records the current hook/API surface, not an authorization guarantee; the server RPCs and routes must enforce admin access.
- The lightweight account picker is read-only; account activation and role changes are available only through the privileged detail actions documented above.
- Reporting hooks can exist before a dedicated report screen is implemented; check the route's actual hook consumers before claiming a chart is visible.
