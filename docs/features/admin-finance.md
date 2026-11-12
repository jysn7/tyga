# Admin finance

This page covers the admin finance workspace at `/admin/finance`.

## Purpose

The finance dashboard is the operational control centre for revenue processing and financial review. It helps administrators track invoices, payments, refunds, donations and membership billing activity without leaving the application.

## Route and usage

- `/admin/finance` — finance dashboard and tabbed workspace
- Tabs include: overview, invoices, payments, refunds, donations and memberships
- Invoice/payment/refund tabs use finance query hooks; donations and membership administration use their own hook families

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

The refunds tab lists refund-review items and supports recording a refund or closing a review when no refund is due. These enrollment refund actions are separate from donation refunds.

The memberships tab is a searchable, filterable, paginated account membership workspace. Its summary includes membership counts, expected monthly card value, received payments and failed charges. The detail panel shows current membership access/status, payment charges, history and recorded admin actions. Depending on the membership, admins can record a manual payment, grant complimentary access through a specified date, end a membership, cancel a card subscription through Paystack, or synchronize the local record with Paystack. Actions that change membership status require a reason. Server-side authorization and the Paystack result remain authoritative.

### Donations

The donations tab provides a separate donation ledger, not part of programme invoices or recurring membership fees. It shows total and current-month amounts/counts and successful donations awaiting receipt follow-up. Admins can search by donor name, email or Paystack reference; filter by status; page through 50 rows; open a donation detail drawer; and export donation records to CSV.

The detail view shows donor and linked-account information when available, anonymity, amount/currency, tier, Paystack reference/transaction ID, status, verification time, receipt history and refund history. For successful donations, an admin can mark a receipt as issued or record a refund with a note. The refund action records the refund in TYGA; it does not itself issue a payment-provider refund. Verify and complete any required Paystack refund separately. The current documented route/hook surface is admin-side donation review; no donor-facing donation checkout page or hook was found.

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

`hooks/admin/use-admin-finance.ts` backs the overview, invoice, payment, refund and basic membership-list surfaces. Invoice and payment lists use 25-row pages with status/search filters; invoice detail includes line items, payment history and the enrollment link. The overview query supplies totals, outstanding/overdue/on-hold amounts, refund-review count, membership totals and revenue breakdowns. The refund tab reads the refund-review queue.

| Hooks | RPCs | Responsibility |
|---|---|---|
| `useFinanceOverview` | `admin_get_finance_overview` | Finance totals and revenue summaries |
| `useAdminInvoices`, `useAdminInvoiceDetail` | `admin_get_invoices`, `admin_get_invoice_detail` | Searchable invoice list and invoice detail |
| `useAdminPayments` | `admin_get_payments` | Searchable payment history |
| `useRefundQueue` | `admin_get_refund_queue` | Paid withdrawals awaiting a refund decision |
| `useRecordManualPayment` | `admin_record_manual_payment` | Record EFT, cash or other manual payment details |
| `useRecordRefund`, `useCloseRefundReview` | `admin_record_refund`, `admin_resolve_refund_review` | Record a refund or close a review when no refund is due |
| `hooks/admin/memberships/use-memberships.ts`: `useMembershipSummary`, `useMembershipsPage`, `useMembershipDetail` | `admin_get_membership_summary`, `admin_get_memberships_page`, `admin_get_membership_detail` | Membership operations summary, filtered account list and account history/detail |
| `useGrantComplimentary`, `useRecordMembershipPayment`, `useEndMembership` | `admin_grant_complimentary_membership`, `admin_record_membership_payment`, `admin_end_membership` | Grant complimentary membership, record off-platform payment, or end membership |
| `useCancelCardMembership`, `useSyncMembership` | `admin_authorize_membership_action`, `admin_log_membership_action`, `membership_get_credentials`, `membership_mark_not_renewing`, `apply_membership_subscription_event` and Paystack subscription APIs | Authorize and cancel a card subscription or reconcile it from Paystack |
| `hooks/admin/use-admin-donations.ts`: `useAdminDonations`, `useAdminDonationStats`, `useAdminDonationDetail` | `admin_get_donations`, `admin_get_donation_stats`, `admin_get_donation_detail` | Search/filter/paginate donations, show summary statistics and read donation details |
| `useMarkReceiptIssued`, `useRecordDonationRefund`, `useExportDonations` | `admin_mark_receipt_issued`, `admin_record_donation_refund`, `admin_export_donations` | Record receipt issuance, record refund follow-up and export donation data as CSV |

Successful invoice/refund mutations invalidate finance, enrollment, parent schedule and coach roster queries. Donation mutations refresh the donation detail, list and stats; membership mutations refresh membership, finance and account queries. A refund-review decision is separate from initiating an external payment-provider refund; verify the operational refund process and provider reconciliation separately.

## Related docs

- [Billing & payments](./billing-and-payments.md)
- [Administration & reporting](./administration-and-reporting.md)
- [Admin enrollments](./admin-enrollments.md)
