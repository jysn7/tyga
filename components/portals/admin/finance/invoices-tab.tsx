// components/portals/admin/finance/invoices-tab.tsx

"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { AlertTriangle, Wallet } from "lucide-react"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  useAdminInvoices,
  type DisplayStatus,
} from "@/hooks/admin/use-admin-finance"
import { InvoiceBadge } from "./finance-badges"
import { InvoiceFiltersBar } from "./finance-filters"
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

export function InvoicesTab({ onOpen }: { onOpen: (id: number) => void }) {
  const [status, setStatus] = useState<DisplayStatus | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const search = useDebounced(searchInput)
  const [page, setPage] = useState(0)

  const {
    data: rows = [],
    isLoading,
    error,
    isFetching,
  } = useAdminInvoices({ status, search, page })
  const total = rows[0]?.total_count ?? 0

  return (
    <div className="flex flex-col gap-4">
      <InvoiceFiltersBar
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
          title="No invoices found"
          description="Try changing the filter or the search."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className={`overflow-x-auto ${isFetching ? "opacity-70" : ""}`}>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/80 text-[11px] tracking-wider text-secondary uppercase dark:bg-foreground">
                  <th className="px-4 py-2.5 font-medium">Invoice</th>
                  <th className="px-4 py-2.5 font-medium">Parent</th>
                  <th className="px-4 py-2.5 font-medium">For</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.invoice_id}
                    tabIndex={0}
                    onClick={() => onOpen(r.invoice_id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onOpen(r.invoice_id)
                      }
                    }}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-b-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                  >
                    <td className="px-4 py-2 text-foreground">
                      #{r.invoice_id}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {r.account_name ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-foreground">
                        {r.member_name ?? r.description ?? "—"}
                      </p>
                      {r.programme_name && (
                        <p className="text-xs text-muted-foreground">
                          {r.programme_name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <InvoiceBadge status={r.display_status} />
                        {r.refund_review && (
                          <AlertTriangle
                            className="h-3.5 w-3.5 text-orange"
                            strokeWidth={1.75}
                            aria-label="Refund decision needed"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-foreground">
                      {money(r.total_amount)}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {fmtDate(r.due_at)}
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
