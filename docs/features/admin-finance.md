# Admin finance

This page covers the admin finance workspace at `/admin/finance`.

## Purpose

The finance dashboard is the operational control centre for revenue processing and financial review. It helps administrators track invoices, payments, refunds, and membership-related billing activity without leaving the application.

## Route and usage

- `/admin/finance` — finance dashboard and tabbed workspace
- Tabs include: overview, invoices, payments, refunds, memberships
- Each tab is driven by the same admin finance table patterns and query hooks

## Pages and tabs

### Overview

The overview tab summarises financial health and recent activity for the programme and membership billing system.

### Invoices

The invoice tab shows invoice records and supports:

- text search and filter controls
- pagination for many records
- invoice detail inspection
- payment capture or approval actions from the invoice sheet

The invoice sheet is used for editing invoice details and capturing payment metadata, such as payment method, reference, and settlement date.

### Payments

The payments tab surfaces payment records, statuses, and settlement metadata. It mirrors the invoice tab's search and pagination pattern for consistency.

### Refunds and memberships

These tabs handle follow-up workflows for refund or membership adjustments, typically tied to invoice and enrollment records.

## Form state and actions

The finance UI uses controlled form state for invoice and payment actions. Resetting fields happens in the action path rather than in a side effect so the form does not re-render unexpectedly while closing or submitting.

This is intentionally kept close to the user interaction flow to avoid stale state and unnecessary re-renders.

## Key responsibilities

- review invoice and payment health
- support settlement and reference tracking
- monitor membership billing activity
- route finance issues to the correct follow-up workflow
- keep lists searchable and paginated for admin operations

## Related docs

- [Billing & payments](./billing-and-payments.md)
- [Administration & reporting](./administration-and-reporting.md)
- [Admin enrollments](./admin-enrollments.md)
