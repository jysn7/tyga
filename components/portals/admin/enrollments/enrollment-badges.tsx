import { EnrollmentStatus } from "@/hooks/admin/use-admin-enrollments"
import {
  StatusPill,
  StatusVariant,
} from "@/components/portals/shared/status-pill"

export const STATUS_META: Record<
  EnrollmentStatus,
  { label: string; variant: StatusVariant }
> = {
  active: { label: "Active", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  paused: { label: "Paused", variant: "info" },
  withdrawn: { label: "Withdrawn", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "neutral" },
  completed: { label: "Completed", variant: "purple" },
}

export function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    variant: "neutral" as StatusVariant,
  }
  return <StatusPill label={meta.label} variant={meta.variant} />
}

export function PaymentBadge({
  status,
  overdue,
  held,
}: {
  status: string | null
  overdue?: boolean
  held?: boolean
}) {
  if (held && (status === "pending" || status === "overdue")) {
    return <StatusPill label="On hold" variant="info" />
  }

  if (!status) {
    return <StatusPill label="No invoice" variant="neutral" />
  }

  const map: Record<string, { label: string; variant: StatusVariant }> = {
    paid: { label: "Paid", variant: "success" },
    partially_paid: { label: "Part paid", variant: "warning" },
    pending: { label: "Unpaid", variant: "warning" },
    overdue: { label: "Overdue", variant: "danger" },
    cancelled: { label: "Cancelled", variant: "neutral" },
  }

  const isLate =
    overdue && (status === "pending" || status === "partially_paid")
  const meta = isLate
    ? map.overdue
    : (map[status] ?? { label: status, variant: "neutral" as StatusVariant })

  return <StatusPill label={meta.label} variant={meta.variant} />
}
