# Admin enrollments

This page covers the admin enrollment review workflow at `/admin/enrollments`.

## Purpose

The admin enrollments dashboard is the operational control surface for family programme sign-ups. It lets staff review every enrollment record, filter by outcome, and open a detailed sheet for deeper action.

## Route and usage

- `/admin/enrollments` — enrollment list and search
- Enrollment rows open an `EnrollmentSheet` detail panel
- The sheet is used for administrative review, follow-up, and payment/refund triage

## What the page shows

- Enrollment summary tiles for status counts and refund activity
- Search/filter controls by status, payment state, programme, and free-text search
- Pagination for large enrollment sets
- A compact table with member, parent, programme, status, payment, and enrollment date

## Common filters

- `status`: pending, active, completed, withdrawn, paused, review-related states
- `payment`: invoice/payment lifecycle filters
- `programmeId`: restrict to a programme
- `search`: member, parent, or programme text search

The current query is handled by `hooks/admin/use-admin-enrollments.ts` and the page uses a debounced search input before querying.

## Review workflow

1. Admin filters the list.
2. Admin clicks a row to open the enrollment detail sheet.
3. The sheet surfaces the enrollment lifecycle and related invoice/payment context.
4. The admin can decide whether follow-up is needed for payment, refund review, or programme coordination.

## Key behavior

- Search is debounced to avoid noisy query churn.
- Page resets when filter values change.
- Rows remain keyboard accessible for screen-reader and keyboard users.
- The page includes a refund review alert banner when any enrollment requires attention.

## Related docs

- [Billing & payments](./billing-and-payments.md)
- [Administration & reporting](./administration-and-reporting.md)
- [Programmes & sessions](./programmes-and-sessions.md)
