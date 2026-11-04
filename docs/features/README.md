# TYGA feature documentation

This directory is the feature-level guide to TYGA. The documents describe the user flows and the current application surfaces; they use the client hooks, route files and Supabase RPC calls as implementation anchors. They are not a replacement for the database migrations or source code.

## Feature areas

| Document | Coverage |
|---|---|
| [Account & security](./account-and-security.md) | Authentication, account preferences, login monitoring and lockouts |
| [Members & onboarding](./members-and-onboarding.md) | Family setup, child intake, profiles, consents, documents and member access |
| [Programmes & sessions](./programmes-and-sessions.md) | Programme administration and discovery, enrollment, coach assignments, sessions, attendance and session curriculum |
| [Discounts & enrollment pricing](./discounts-and-pricing.md) | Admin discount rules, promo codes, grants and parent-facing programme price previews |
| [Curriculum progressions](./curriculum-progressions.md) | Level and module administration, session tags, member milestones and verified progression support |
| [Billing & payments](./billing-and-payments.md) | Membership subscriptions, invoices, payments, checkout and reconciliation |
| [Admin finance](./admin-finance.md) | Admin finance dashboard, invoice review, settlements, refund follow-up and membership billing operations |
| [Admin enrollments](./admin-enrollments.md) | Enrollment review workflow, application triage, lifecycle states and admin follow-up actions |
| [Appointments](./appointments.md) | Coach availability, parent bookings, assessment queue and unified schedules |
| [Messaging & Support](./messaging-and-support.md) | Parent/coach direct messages, support tickets and the admin support queue |
| [Events](./events.md) | Admin-managed events, registration visibility and event image storage |
| [Admin marketing site](./admin-marketing-site.md) | Admin-managed public-site events, programme cards, team profiles, gallery and site copy |
| [Venues](./venues.md) | Venue records, address capture, map selection and lookups |
| [Notifications, search & PWA](./notifications-and-search.md) | Notification inbox, preferences and delivery, role-scoped search and installability |
| [Administration & reporting](./administration-and-reporting.md) | Admin dashboard, accounts, coaches, invitations, settings and audit/reporting hooks |

## How the hooks fit

Most feature data is loaded and changed through typed React Query hooks under `hooks/`. The hooks call Supabase RPCs, Supabase Edge Functions, or app API routes; successful mutations invalidate the affected query keys so pages refresh from authoritative server data. A few workflows (for example profile settings and notification preferences) are implemented directly in page/component code rather than through a dedicated hook.

When a feature appears in a hook but has no matching route or user-facing page, the relevant feature document marks it as hook/API coverage rather than claiming that a complete UI exists. Absence of a hook alone does not prove the absence of a database capability.

## Schema capabilities without a complete UI

The migrations include some data-model capabilities that are not documented as complete user-facing workflows: gear rental and sponsorship allocation tables, and event registration check-in fields. The event guide describes the current registration surface and explicitly distinguishes ticket/check-in schema support from a complete scanning workflow. Treat these as extension points, not shipped end-to-end features.

## Documentation maintenance

- Keep one canonical document per feature area; add cross-links rather than copying full explanations between domains.
- Verify function names and route claims against the current source when changing behavior.
- Label incomplete or unverified behavior explicitly instead of presenting an intended design as shipped functionality.
