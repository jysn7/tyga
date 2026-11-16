// components/portals/client/billing/membership-card.tsx
"use client"

import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ShieldCheck, ArrowRight } from "lucide-react"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"

type MembershipStatus =
  | "pending"
  | "active"
  | "non_renewing"
  | "cancelled"
  | "attention"
  | "expired"
  | null

const STATUS_CONFIG: Record<
  Exclude<MembershipStatus, null>,
  { label: string; variant: StatusVariant }
> = {
  pending: { label: "Pending", variant: "warning" },
  active: { label: "Active", variant: "success" },
  non_renewing: { label: "Cancels soon", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "neutral" },
  expired: { label: "Expired", variant: "neutral" },
  attention: { label: "Payment failed", variant: "danger" },
}

const formatDate = (iso: string | null) =>
  iso ? format(parseISO(iso), "d MMM yyyy") : null

export function MembershipCard({
  status,
  currentPeriodEnd,
  amount = 100,
}: {
  status: MembershipStatus
  currentPeriodEnd: string | null
  amount?: number
}) {
  const config = status ? STATUS_CONFIG[status] : null
  const endDate = formatDate(currentPeriodEnd)

  // The "Manage" link is always visible. The card never acts — it only
  // summarises. Everything that mutates happens on /billing/membership,
  // which owns the start/cancel/resume flows.
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-card p-5 shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
            <ShieldCheck
              className="h-4 w-4 text-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Academy membership
              </h3>
              {config && (
                <StatusPill label={config.label} variant={config.variant} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              R{amount.toFixed(2)} per month · Required to enrol in any
              programme
            </p>
          </div>
        </div>
      </div>

      {/* Context line — changes with status */}
      <div className="text-xs text-muted-foreground">
        {status === "active" && endDate && (
          <span>Next payment on {endDate}.</span>
        )}
        {status === "non_renewing" && endDate && (
          <span>
            Your membership ends on {endDate}. Resume it anytime before then to
            stay enrolled.
          </span>
        )}
        {status === "attention" && (
          <span className="text-destructive">
            Your last payment didn&apos;t go through. Update your card to keep
            your membership active.
          </span>
        )}
        {status === "pending" && (
          <span>
            We&apos;re waiting for your bank to confirm the first payment.
            Membership activates once it clears.
          </span>
        )}
        {status === "expired" && (
          <span>Your membership expired. Subscribe again to keep access.</span>
        )}
        {(status === null || status === "cancelled") && (
          <span>
            Membership is required for every family enrolled at the academy.
            Subscribe to complete your registration.
          </span>
        )}
      </div>

      {/* Action — always a link, never a mutation */}
      <div>
        <Link
          href="/billing/membership"
          className="inline-flex items-center gap-1 text-sm font-medium text-information underline underline-offset-4 hover:opacity-80"
        >
          {status === null || status === "cancelled" || status === "expired"
            ? "Set up membership"
            : "Manage membership"}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  )
}
