# Billing & Payments

This document covers account-level membership billing, programme invoices and payment processing.

## Summary

TYGA uses Paystack for membership fees and programme fee collection. The app starts checkout server-side and mirrors provider outcomes locally through verified webhooks. Client-side checkout completion is not by itself proof of payment.

## Membership subscription

### Features

- One-click subscription from the billing page
- Paystack-hosted checkout with no card data touching the app server
- Monthly family membership charged once per parent account
- Status tracking for pending, active, non-renewing, cancelled and attention-needed memberships
- The signed-in account query exposes the current membership status and period end

### Data model

| Table | Purpose |
|---|---|
| `app_settings` | Shared platform payment/invoice configuration; membership plan amount and interval are configured through Paystack |
| `accounts` | Paystack customer references and tokens |
| `memberships` | Subscription lifecycle and payment schedule |

### Membership statuses

- `pending`
- `active`
- `non_renewing`
- `cancelled`
- `attention`

### Webhook and RPC flow

- `create-subscription` creates a Paystack transaction and redirects the parent
- `paystack-webhook` verifies the Paystack signature and updates the membership row
- `cancel-subscription` records the cancellation intent and then requests Paystack disablement
- `upsert_membership_from_paystack`, `mark_membership_cancelled`, `mark_membership_non_renewing`, `mark_membership_attention` keep the local row in sync
- `account_has_active_membership` gates features based on membership status

## Programme invoicing

### Parent features

- Enroll and pay in one flow
- View all invoices by status and pay outstanding balances from the invoice list
- Automatic enrollment activation after successful payment webhook confirmation

### Admin features

The admin finance route and reporting hooks provide revenue/finance visibility. No dedicated admin membership-history hook was found in the current hook tree.

### Data model

| Table | Purpose |
|---|---|
| `invoices` | Invoice totals and status |
| `invoice_line_items` | Programme or related fees per invoice |
| `payments` | Individual payment attempts and payment records |

### Webhook flow

- `initialize-payment` creates a pending `payments` row with a Paystack reference
- `paystack-webhook` validates the HMAC signature and updates `payments` and `invoices`
- `charge.success` activates the relevant enrollment
- `charge.failed` leaves the enrollment unchanged but records payment failure

## Client hook map

| Hook | Responsibility |
|---|---|
| `hooks/client/use-membership.ts` | Invokes `create-subscription` and `cancel-subscription`; cancellation refreshes billing summary and account data |
| `hooks/client/use-my-account.ts` | Reads the current account and the membership status/current period end displayed by billing surfaces |
| `hooks/client/use-invoices.ts` | Reads filtered invoices, invoice detail with line items/payment history, filtered payment history and billing summary |
| `hooks/client/use-parent-overview.ts` | Supplies the dashboard's outstanding-invoice cards |
| `hooks/client/use-enroll.ts` | Starts programme enrollment through `POST /api/enroll`; response carries authorization URL, payment reference, enrollment ID and invoice ID |
| `hooks/lookups/use-academy-settings.ts` | Reads payment configuration (currency, VAT, invoice prefix/due days, bank details) along with other app settings |

`useInvoices` supports status filtering; `usePayments` supports date range, payment status and method filters. The parent billing pages consume these hooks, while the payment callback route handles the browser return from checkout. The callback is a UX step only; the webhook is authoritative.

## Billing experience

### Parent billing page (`/billing`)

- Summary cards for outstanding, paid, upcoming and last payment
- Filterable invoice list by status
- Invoice detail view with payments, totals and balance
- PDF export support for invoice download

Related routes include `/billing`, `/billing/[id]`, `/billing/invoices/[id]` and `/payment/callback`.

## Key behaviours

- A membership is flat per account rather than per member
- Payment state is treated as authoritative from Paystack, not reversed from client UI
- Duplicate webhook deliveries are idempotent
- A parent can only access their own invoices and memberships
- Payment webhook validation runs before any state is trusted
- `payments` is write-protected to service-role handlers only

## Infrastructure and secrets

Required Paystack configuration:

| Name | Need |
|---|---|
| `PAYSTACK_SECRET_KEY` | Signature verification |
| `PAYSTACK_PLAN_CODE` | Membership plan initiation |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side payment updates |
| `SITE_URL` | Payment redirect and webhook callbacks |

## Setup order

Follow the current Supabase migration and function deployment history for the exact setup sequence. Configure the Paystack plan and required server-side secrets before enabling checkout; register the Paystack webhook endpoint and verify signature/idempotency behavior before processing live payments.

## Not implemented

- Per-member pricing or graduated membership tiers
- Proration for mid-cycle changes
- Manual in-app card updates
- Refund processing flows
- Automated retry or dunning flows
- Accounting export integrations
