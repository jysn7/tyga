// components/portals/admin/finance/payments-tab.tsx

"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { Wallet } from "lucide-react"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  useAdminPayments,
  type PaymentStatus,
} from "@/hooks/admin/use-admin-finance"
import { PaymentBadge } from "./finance-badges"
import { PaymentFiltersBar } from "./finance-filters"
import { FinancePager } from "./finance-pager"

const money = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
      }).format(n)

const fmtDate = (s: string | null | undefined) =>
  s ? format(parseISO(s), "d MMM yyyy") : "—"

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function PaymentsTab({
  onOpenInvoice,
}: {
  onOpenInvoice: (id: number) => void
}) {
  const [status, setStatus] = useState<PaymentStatus | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const search = useDebounced(searchInput)
  const [page, setPage] = useState(0)

  const {
    data: rows = [],
    isLoading,
    error,
    isFetching,
  } = useAdminPayments({ status, search, page })
  const total = rows[0]?.total_count ?? 0

  return (
    <div className="flex flex-col gap-4">
      <PaymentFiltersBar
        searchInput={searchInput}
        onSearchChange={(value) => {
          setSearchInput(value)
          setPage(0)
        }}
        status={status}
        onStatusChange={(s) => {
          setStatus(s)
          setPage(0)
        }}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payments found"
          description="Try changing the filter or the search."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className={`overflow-x-auto ${isFetching ? "opacity-70" : ""}`}>
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/80 text-[11px] tracking-wider text-secondary uppercase dark:bg-foreground">
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Parent</th>
                  <th className="px-4 py-2.5 font-medium">For</th>
                  <th className="px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Method</th>
                  <th className="px-4 py-2.5 font-medium">Reference</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.payment_id}
                    tabIndex={0}
                    onClick={() => onOpenInvoice(r.invoice_id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onOpenInvoice(r.invoice_id)
                      }
                    }}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-b-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                  >
                    <td className="px-4 py-2 text-muted-foreground">
                      {fmtDate(r.paid_at)}
                    </td>
                    <td className="px-4 py-2 text-foreground">
                      {r.account_name ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {r.member_name ?? `Invoice #${r.invoice_id}`}
                    </td>
                    <td className="px-4 py-2 text-foreground">
                      {money(r.amount)}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {[r.method, r.channel].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td
                      className="max-w-[160px] truncate px-4 py-2 text-xs text-muted-foreground"
                      title={r.gateway_reference ?? ""}
                    >
                      {r.gateway_reference ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      <PaymentBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FinancePager page={page} setPage={setPage} total={total} />
        </div>
      )}
    </div>
  )
}
