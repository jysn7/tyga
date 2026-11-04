# Discounts & Enrollment Pricing

This guide covers the admin discount controls and the parent-facing programme price preview. Discounts affect programme enrollment invoices; they are separate from membership subscription billing.

## Admin discount management

Admins manage discounts at `/admin/programmes/discounts`. The list shows each discount's trigger, value, redemption count and computed status; admins can search, create, edit, pause/resume and delete discounts. A discount can be scoped to programme types, specific programmes, or both.

The editor supports three trigger types:

| Trigger | How it is configured |
|---|---|
| Automatic | Applies when a configured condition is met: everyone, sibling enrollment, multi-programme enrollment, early-bird timing, or active membership |
| Promo code | Requires a code entered during enrollment |
| Admin grant | A staff member grants the discount to a parent, optionally restricted to one child and/or programme, with an expiry and private reason |

Each discount can be a percentage or fixed rand amount, have start/end dates and total/per-parent redemption limits, and be marked active. Automatic-condition values are configurable where relevant. Discounts can be marked stackable and assigned a priority; the editor describes the selection rule as the best non-stackable discount plus applicable stackable discounts, applied in priority order to the remaining price. The server-side pricing result remains authoritative.

An admin-granted discount records the parent, optional child/programme, expiry, reason, grantor and active/revoked state. The discount detail panel exposes redemption usage and grant history, and lets an admin revoke a grant. The public label is used for parent-visible invoice/pricing text; the optional public description controls whether an automatic offer is shown on the public programme page. Keep bursary labels neutral and grant reasons private.

## Parent-facing pricing

- The programme listing can show a dismissible carousel of public offers. A dismissal is stored in this browser; the banner uses its own version key to allow a future banner version to be shown again.
- The enrollment dialog previews the selected child's price, including discount lines and the amount due. Parents can enter and apply a promo code; invalid or inapplicable codes show an inline message.
- A promo code is sent for enrollment only after the preview reports it as applied. The enrollment endpoint calls `parent_create_enrollment` with the member, programme and optional code, then initializes Paystack for a positive balance.
- When the computed balance is zero, the endpoint skips Paystack and returns the free-enrollment callback URL. The database is expected to have already marked the invoice paid and enrollment active.
- Paystack and its webhook remain authoritative for positive-balance payments; see [Billing & payments](./billing-and-payments.md).

## Hook and API map

| Surface | Implementation | Responsibility |
|---|---|---|
| Admin discount list and editor | `hooks/admin/programmes/use-discounts.ts` | Lists discounts, usage and grants; saves, activates/deactivates, deletes, grants and revokes |
| Public offer banner | `hooks/shared/use-pricing.ts` | Reads the public discount list |
| Enrollment dialog | `components/portals/client/programmes/enroll-modal.tsx` | Previews price, validates the promo code and starts enrollment |
| Enrollment request | `hooks/client/use-enroll.ts`, `app/api/enroll/route.ts` | Sends the optional promo code, creates the enrollment/invoice and starts checkout when needed |

The discount hooks call `admin_get_discounts`, `admin_get_discount_usage`, `admin_get_discount_grants`, `admin_get_marketing_programmes`, `admin_save_discount`, `admin_set_discount_active`, `admin_delete_discount`, `admin_grant_discount`, `admin_revoke_discount_grant`, `get_public_discounts` and `parent_preview_enrollment_price`. Query errors are surfaced by the hooks; successful admin mutations refresh the discount query family.

`usePreviewPrice` and `useCreateEnrollment` are also exported by `hooks/shared/use-pricing.ts`, but the current enrollment dialog calls the preview RPC directly and starts enrollment through `useEnroll`/`/api/enroll`. No current consumer of those two exported helpers was found.

## Deployment and verification boundary

The checked-in `supabase/migrations` directory does not define the discount schema or the discount RPCs listed above. The app code therefore depends on database objects supplied outside the current migration history. Verify those objects, their authorization rules and the pricing/redemption behavior in the target Supabase project before treating discounts as deployable or relying on UI configuration alone. The parent enrollment function and payment webhook must also be deployed consistently with the pricing rules.

## Related guides

- [Programmes & sessions](./programmes-and-sessions.md)
- [Billing & payments](./billing-and-payments.md)
- [Admin enrollments](./admin-enrollments.md)
