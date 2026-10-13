import {
  StatusPill,
  StatusVariant,
} from "@/components/portals/shared/status-pill"
import type {
  DisplayStatus,
  PaymentStatus,
} from "@/hooks/admin/use-admin-finance"

export const INVOICE_META: Record<
  DisplayStatus,
  { label: string; variant: StatusVariant }
> = {
  pending: { label: "Unpaid", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  overdue: { label: "Overdue", variant: "danger" },
  on_hold: { label: "On hold", variant: "info" },
  cancelled: { label: "Cancelled", variant: "neutral" },
}

export const PAYMENT_META: Record<
  PaymentStatus,
  { label: string; variant: StatusVariant }
> = {
  paid: { label: "Paid", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  failed: { label: "Failed", variant: "danger" },
  refunded: { label: "Refunded", variant: "purple" },
}

export const MEMBERSHIP_META: Record<
  string,
  { label: string; variant: StatusVariant }
> = {
  active: { label: "Active", variant: "success" },
  non_renewing: { label: "Not renewing", variant: "warning" },
  attention: { label: "Needs attention", variant: "danger" },
  pending: { label: "Pending", variant: "info" },
  cancelled: { label: "Cancelled", variant: "neutral" },
}

export function InvoiceBadge({ status }: { status: DisplayStatus }) {
  const meta = INVOICE_META[status] ?? {
    label: status,
    variant: "neutral" as StatusVariant,
  }
  return <StatusPill label={meta.label} variant={meta.variant} />
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const meta = PAYMENT_META[status] ?? {
    label: status,
    variant: "neutral" as StatusVariant,
  }
  return <StatusPill label={meta.label} variant={meta.variant} />
}

export function MembershipBadge({ status }: { status: string }) {
  const meta = MEMBERSHIP_META[status] ?? {
    label: status,
    variant: "neutral" as StatusVariant,
  }
  return <StatusPill label={meta.label} variant={meta.variant} />
}
