# Payments & Invoicing — README

Paystack integration for programme fees, with webhook-based confirmation.

---

## Features

### Parent

- **Enroll & pay** — one flow: select eligible member → confirm details → redirect to Paystack hosted checkout
- **Invoices page** — every invoice, status (pending/paid/partially paid/overdue/cancelled), pay-now for anything unpaid
- **Automatic enrollment activation** — no manual step; the enrollment activates itself once payment is confirmed

### Admin

- **Invoice oversight** — every family's billing history, for investigating discrepancies
- **Payment reconciliation** — handled automatically by the webhook, not manual entry

---

## Data model

| Table | What it holds |
|---|---|
| `invoices` | One per account, `total_amount`, `status` |
| `invoice_line_items` | Individual charges (programme fee, gear rental, event fee, etc.) |
| `payments` | Settles an invoice, Paystack `gateway_reference` (unique), `status`, `channel` |

---

## Edge Functions / API Routes

| Function | Summary |
|---|---|
| `initialize-payment` | Confirms the caller owns the invoice (via RLS-scoped client), calls Paystack's Initialize Transaction API, creates a `pending` `payments` row with the Paystack reference |
| `paystack-webhook` | Verifies `x-paystack-signature` (HMAC SHA512), updates `payments`/`invoices` on `charge.success` or `charge.failed`, activates the enrollment on success |

---

## Hooks

| File | Exports |
|---|---|
| `hooks/client/use-enroll.ts` | `useEnroll` — creates the enrollment, calls `initialize-payment`, returns the Paystack redirect URL |
| `hooks/client/use-invoices.ts` | `useInvoices` |

---

## Pages

| Route | Role | Purpose |
|---|---|---|
| `/invoices` | Parent | Invoice list, pay-now |
| (modal, not a route) | Parent | Enroll modal, ends in a Paystack redirect |
| `/admin/invoices` | Admin | Billing oversight, all families |

---

## Key behaviours

| Rule | Where enforced |
|---|---|
| An enrollment is created as `pending`, never `active`, by the client | `parent_create_enrollment` |
| Only the payment webhook can activate an enrollment | RLS on `enrollments`, service-role-only write on `payments` |
| Webhook signature is verified before any data is trusted | HMAC SHA512 check in `paystack-webhook` |
| Duplicate webhook delivery doesn't double-process | Unique `payments.gateway_reference`, idempotency check by reference |
| A failed/declined payment leaves the enrollment untouched | `charge.failed` branch only updates `payments.status`, not `enrollments` |
| `payments` has no client-writable RLS policy at all | Table policy — select-only for parents/admin, write via service role only |

---

## Setup order

1. `01-invoices-schema.sql`
2. `02-payments-schema.sql` — includes Paystack-specific fields (`gateway_reference`, `paystack_transaction_id`, `channel`)
3. Deploy `initialize-payment` and `paystack-webhook`
4. Set `PAYSTACK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL` as function secrets
5. Point Paystack's dashboard webhook URL at the deployed `paystack-webhook` endpoint
6. `notify pgrst, 'reload schema';`

---

## Not implemented

- Refunds (mid-term cancellation refunds are handled manually by admin, outside the platform)
- Multi-line invoices in the UI (schema supports it; enrollment currently generates a single line item)
- Partial payment UI (schema supports `partially_paid` status; no flow currently creates one)
- Accounting export (Xero/QuickBooks sync)