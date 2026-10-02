"use client"

import { format } from "date-fns"
import { Check, AlertTriangle } from "lucide-react"
import { Loader } from "@/components/portals/shared/loader"
import { usePaymentSummary } from "@/hooks/client/use-invoices"

function formatRand(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function SummaryCards() {
  const { data, isLoading } = usePaymentSummary()

  if (isLoading || !data) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }

  const hasOutstanding = data.totalOutstanding > 0
  const isOverdue = data.nextDueAt
    ? new Date(data.nextDueAt) < new Date()
    : false

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Outstanding */}
        <div className="flex flex-col gap-2 rounded-xl bg-card p-5 shadow">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Outstanding
          </span>
          <div className="flex items-center gap-2">
            {hasOutstanding ? (
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {formatRand(data.totalOutstanding)}
              </span>
            ) : (
              <>
                <Check className="h-5 w-5 text-green" strokeWidth={2} />
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  All settled
                </span>
              </>
            )}
          </div>
          {hasOutstanding && data.nextDueAt && (
            <span
              className={`text-xs ${
                isOverdue ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {isOverdue ? "Overdue" : "Due"}{" "}
              {format(new Date(data.nextDueAt), "d MMM yyyy")}
            </span>
          )}
        </div>

        {/* Next due */}
        <div className="flex flex-col gap-2 rounded-xl bg-card p-5 shadow">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            {isOverdue ? "Overdue" : "Next due"}
          </span>
          {data.nextDueAt ? (
            <>
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {formatRand(data.nextDueAmount)}
              </span>
              <span
                className={`flex items-center gap-1 text-xs ${
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {isOverdue && (
                  <AlertTriangle className="h-3 w-3" strokeWidth={2} />
                )}
                {format(new Date(data.nextDueAt), "d MMM yyyy")}
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Nothing due
            </span>
          )}
        </div>
      </div>

      {/* Context line */}
      {(data.totalPaid > 0 || data.lastPaymentAt) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {data.totalPaid > 0 && (
            <span>{formatRand(data.totalPaid)} paid to date</span>
          )}
          {data.lastPaymentAt && (
            <span>
              Last payment {format(new Date(data.lastPaymentAt), "d MMM yyyy")}
              {data.lastPaymentAmount > 0
                ? ` · ${formatRand(data.lastPaymentAmount)}`
                : ""}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
