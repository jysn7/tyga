// components/portals/admin/finance/refunds-tab.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Field } from "@/components/portals/shared/field"
import {
  useCloseRefundReview,
  useRecordRefund,
  useRefundQueue,
  type RefundRow,
} from "@/hooks/admin/use-admin-finance"

const ENROLMENTS_ROUTE = "/admin/enrollments"

const money = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
      }).format(n)

const fmtDate = (s: string | null | undefined) =>
  s ? format(parseISO(s), "d MMM yyyy") : "—"

function RefundCard({ row }: { row: RefundRow }) {
  const refund = useRecordRefund()
  const dismiss = useCloseRefundReview()
  const [mode, setMode] = useState<"refund" | "none" | null>(null)
  const [note, setNote] = useState("")
  const pending = refund.isPending || dismiss.isPending
  const error = refund.error ?? dismiss.error

  function confirm() {
    if (mode === "refund")
      refund.mutate({ enrollmentId: row.enrollment_id, note })
    if (mode === "none") dismiss.mutate(row.enrollment_id)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">
            {row.member_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.programme_name} · parent {row.parent_name ?? "—"}
          </p>
        </div>
        <span className="text-sm font-semibold text-foreground">
          {money(row.amount)}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Paid {fmtDate(row.paid_at)} · enrolment {row.enrollment_status} ·
        flagged {fmtDate(row.flagged_at)}
      </p>
      {row.reason && (
        <p className="text-xs text-muted-foreground">
          Reason given: “{row.reason}”
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        <Link
          href={`${ENROLMENTS_ROUTE}?enrollment=${row.enrollment_id}`}
          className="text-primary underline"
        >
          View enrolment
        </Link>
      </div>

      {!mode ? (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setMode("refund")}>
            Record refund
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMode("none")}>
            No refund due
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">
            {mode === "refund"
              ? `Only record this after the ${money(row.amount)} has actually been returned (Paystack or bank). The payment is marked refunded and the invoice cancelled.`
              : "This closes the review and leaves the payment as received. Use it when your policy says no refund is owed."}
          </p>
          {mode === "refund" && (
            <Field label="Note (optional)">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={300}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </Field>
          )}
          {error && <p className="text-xs text-destructive">{error.message}</p>}
          <div className="flex gap-2">
            <Button size="sm" disabled={pending} onClick={confirm}>
              {pending
                ? "Saving..."
                : mode === "refund"
                  ? "Confirm refund"
                  : "Confirm no refund"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setMode(null)}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function RefundsTab() {
  const { data: rows = [], isLoading, error } = useRefundQueue()

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error.message}
      </div>
    )
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No refunds waiting"
        description="A paid enrolment that is withdrawn appears here for a decision."
      />
    )
  }
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r) => (
        <RefundCard key={r.enrollment_id} row={r} />
      ))}
    </div>
  )
}
