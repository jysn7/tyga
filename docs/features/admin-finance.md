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
- manual payment recording when the invoice permits it

The invoice sheet captures the payment method, reference, payment date and note; the hook does not expose a general invoice-edit mutation.

### Payments

The payments tab surfaces payment records, statuses, and settlement metadata. It mirrors the invoice tab's search and pagination pattern for consistency.

### Refunds and memberships

The refunds tab lists refund-review items and supports recording a refund or closing a review when no refund is due. The memberships tab is a status-filtered view; the current finance hook exposes no membership mutation.

## Form state and actions

The finance UI uses controlled form state for invoice and payment actions. Resetting fields happens in the action path rather than in a side effect so the form does not re-render unexpectedly while closing or submitting.

This is intentionally kept close to the user interaction flow to avoid stale state and unnecessary re-renders.

## Key responsibilities

- review invoice and payment health
- support settlement and reference tracking
- monitor membership billing activity
- route finance issues to the correct follow-up workflow
- keep lists searchable and paginated for admin operations

## Hook and RPC coverage

`hooks/admin/use-admin-finance.ts` backs the finance workspace. Invoice and payment lists use 25-row pages with status/search filters; invoice detail includes line items, payment history and the enrollment link. The overview query supplies totals, outstanding/overdue/on-hold amounts, refund-review count, membership totals and revenue breakdowns. The refund tab reads the refund-review queue, and the memberships tab filters membership rows by status.

| Hooks | RPCs | Responsibility |
|---|---|---|
| `useFinanceOverview` | `admin_get_finance_overview` | Finance totals and revenue summaries |
| `useAdminInvoices`, `useAdminInvoiceDetail` | `admin_get_invoices`, `admin_get_invoice_detail` | Searchable invoice list and invoice detail |
| `useAdminPayments` | `admin_get_payments` | Searchable payment history |
| `useRefundQueue` | `admin_get_refund_queue` | Paid withdrawals awaiting a refund decision |
| `useAdminMemberships` | `admin_get_memberships` | Membership list by status |
| `useRecordManualPayment` | `admin_record_manual_payment` | Record EFT, cash or other manual payment details |
| `useRecordRefund`, `useCloseRefundReview` | `admin_record_refund`, `admin_resolve_refund_review` | Record a refund or close a review when no refund is due |

Successful money mutations invalidate finance, enrollment, parent schedule and coach roster queries. A refund-review decision is separate from initiating an external payment-provider refund; verify the operational refund process and provider reconciliation separately.

## Related docs

- [Billing & payments](./billing-and-payments.md)
- [Administration & reporting](./administration-and-reporting.md)
- [Admin enrollments](./admin-enrollments.md)
