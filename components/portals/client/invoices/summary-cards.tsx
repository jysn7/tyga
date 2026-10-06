// components/portals/client/billing/summary-cards.tsx
"use client"

import { format } from "date-fns"
import { AlertCircle, CalendarClock, CheckCircle2, Wallet } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { StatTile } from "@/components/portals/client/overview/stat-tile"
import { useBillingSummary } from "@/hooks/client/use-invoices"

function formatRand(amount: number) {
  return `R${amount.toFixed(2)}`
}

export function SummaryCards() {
  const { data, isLoading, error } = useBillingSummary()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border/50"
          >
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
        <AlertCircle
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
          strokeWidth={1.75}
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Failed to load billing summary.
        </p>
      </div>
    )
  }

  const hasOutstanding = data.totalOutstanding > 0

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="Outstanding"
        value={formatRand(data.totalOutstanding)}
        hint={hasOutstanding ? "Across open invoices" : "All settled"}
        icon={Wallet}
        color={hasOutstanding ? "orange" : "green"}
        compact
      />

      <StatTile
        label="Paid to date"
        value={formatRand(data.totalPaid)}
        hint={
          data.lastPaymentAt
            ? `Last ${format(new Date(data.lastPaymentAt), "d MMM")}`
            : "No payments yet"
        }
        icon={CheckCircle2}
        color="green"
        compact
      />

      <StatTile
        label="Next due"
        value={data.nextDueAt ? format(new Date(data.nextDueAt), "d MMM") : "—"}
        hint={
          data.nextDueAt ? formatRand(data.nextDueAmount) : "Nothing scheduled"
        }
        icon={CalendarClock}
        color="blue"
        compact
      />

      <StatTile
        label="Last payment"
        value={data.lastPaymentAt ? formatRand(data.lastPaymentAmount) : "—"}
        hint={
          data.lastPaymentAt
            ? format(new Date(data.lastPaymentAt), "d MMM yyyy")
            : "No payments yet"
        }
        icon={CheckCircle2}
        color="teal"
        compact
      />
    </div>
  )
}
