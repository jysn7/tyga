// components/portals/admin/enrollments/admin-enrollments-page.tsx

"use client"

import { useEffect, useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Users, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  PAGE_SIZE,
  useAdminEnrollments,
  useEnrollmentProgrammeOptions,
  useEnrollmentSummary,
  type EnrollmentFilters,
  type EnrollmentStatus,
  type PaymentFilter,
} from "@/hooks/admin/use-admin-enrollments"
import { StatusBadge, PaymentBadge } from "./enrollment-badges"
import { EnrollmentTiles } from "./enrollment-tiles"
import { EnrollmentFiltersBar } from "./enrollment-filters"
import { EnrollmentSheet } from "./enrollment-sheet"

const fmtDate = (iso: string) => format(parseISO(iso), "d MMM yyyy")

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function AdminEnrollmentsPage() {
  const [status, setStatus] = useState<EnrollmentStatus | null>(null)
  const [payment, setPayment] = useState<PaymentFilter | null>(null)
  const [programmeId, setProgrammeId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const search = useDebounced(searchInput)
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filters: EnrollmentFilters = useMemo(
    () => ({ status, payment, programmeId, search, page }),
    [status, payment, programmeId, search, page]
  )

  const { data: summary } = useEnrollmentSummary()
  const { data: programmes = [] } = useEnrollmentProgrammeOptions()
  const {
    data: rows = [],
    isLoading,
    error,
    isFetching,
  } = useAdminEnrollments(filters)

  const total = rows[0]?.total_count ?? 0
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1
  const to = Math.min((page + 1) * PAGE_SIZE, total)

  return (
    <div className="flex flex-col gap-6">
      <EnrollmentTiles
        summary={summary}
        currentStatus={status}
        onSelectStatus={(s) => {
          setStatus(s)
          setPage(0)
        }}
      />

      {!!summary?.refund_reviews && (
        <div className="flex items-center gap-2 rounded-xl border border-orange bg-orange-light px-4 py-2.5 text-sm text-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {summary.refund_reviews} refund{" "}
          {summary.refund_reviews === 1 ? "review needs" : "reviews need"} a
          decision.
        </div>
      )}

      <EnrollmentFiltersBar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={(s) => {
          setStatus(s)
          setPage(0)
        }}
        payment={payment}
        onPaymentChange={(p) => {
          setPayment(p)
          setPage(0)
        }}
        programmeId={programmeId}
        onProgrammeChange={(p) => {
          setProgrammeId(p)
          setPage(0)
        }}
        programmes={programmes}
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
          icon={Users}
          title="No enrolments found"
          description="Try changing the filters or the search."
        />
      ) : (
        <div
          className={`overflow-hidden rounded-xl bg-card shadow ${isFetching ? "opacity-70" : ""}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/80 text-[11px] tracking-wider text-secondary uppercase dark:bg-foreground">
                  <th className="px-4 py-2.5 font-medium">Member</th>
                  <th className="px-4 py-2.5 font-medium">Parent</th>
                  <th className="px-4 py-2.5 font-medium">Programme</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Payment</th>
                  <th className="px-4 py-2.5 font-medium">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.enrollment_id}
                    tabIndex={0}
                    onClick={() => setSelectedId(r.enrollment_id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedId(r.enrollment_id)
                      }
                    }}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-b-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                  >
                    <td className="px-4 py-2 text-foreground">
                      {r.member_name}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {r.parent_name ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-foreground">{r.programme_name}</p>
                      {r.level_name && (
                        <p className="text-xs text-muted-foreground">
                          {r.level_name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={r.status} />
                        {r.refund_review && (
                          <AlertTriangle
                            className="h-3.5 w-3.5 text-orange"
                            strokeWidth={1.75}
                            aria-label="Refund review needed"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <PaymentBadge
                        status={r.invoice_status}
                        overdue={r.is_overdue}
                      />
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {r.joined_at ? fmtDate(r.joined_at) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              {from}–{to} of {total}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Previous page"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Next page"
                disabled={to >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </div>
      )}

      <EnrollmentSheet id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
