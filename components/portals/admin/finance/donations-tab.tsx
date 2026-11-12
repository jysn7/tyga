"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Download, Search } from "lucide-react"
import { SearchInput } from "@/components/portals/shared/search-input"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useAdminDonations,
  useAdminDonationStats,
  useExportDonations,
} from "@/hooks/admin/use-admin-donations"
import { toast } from "@/components/ui/toast"
import { DonationDetailDrawer } from "./donation-detail-drawer"

const PAGE_SIZE = 50

const fmtDate = (s: string | null) =>
  s ? format(parseISO(s), "d MMM yyyy") : "—"

const fmtMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
  }).format(amount)

const STATUS_TONE: Record<string, string> = {
  success: "bg-green-light text-foreground",
  pending: "bg-blue-light text-foreground",
  failed: "bg-red-light text-foreground",
  abandoned: "bg-muted text-muted-foreground",
  refunded: "bg-orange-light text-foreground",
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "success", label: "Successful" },
  { value: "refunded", label: "Refunded" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "abandoned", label: "Abandoned" },
]

export function DonationsTab() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [offset, setOffset] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: stats } = useAdminDonationStats(6)
  const {
    data: rows = [],
    isLoading,
    error,
  } = useAdminDonations({
    status: status === "all" ? null : status,
    search: search || null,
    limit: PAGE_SIZE,
    offset,
  })

  const total = rows[0]?.totalCount ?? 0
  const hasMore = offset + rows.length < total

  const exportMutation = useExportDonations()

  function handleExport() {
    exportMutation.mutate(
      { from: null, to: null },
      {
        onSuccess: (csv) => {
          const blob = new Blob([csv], { type: "text/csv" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `donations-${format(new Date(), "yyyy-MM-dd")}.csv`
          a.click()
          URL.revokeObjectURL(url)
        },
        onError: (err) =>
          toast.add({
            title: "Export failed",
            description: err instanceof Error ? err.message : "Try again",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Total raised"
            value={fmtMoney(stats.total_amount, "ZAR")}
          />
          <Stat label="Donations" value={stats.total_count} />
          <Stat
            label="This month"
            value={fmtMoney(stats.this_month_amount, "ZAR")}
          />
          <Stat
            label="Receipts pending"
            value={stats.receipts_pending}
            tone={stats.receipts_pending > 0 ? "warn" : "default"}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v)
            setOffset(0)
          }}
          placeholder="Search by name, email or reference…"
          className="flex-1 lg:max-w-sm"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v ?? "all")
            setOffset(0)
          }}
        >
          <SelectTrigger className="h-9 w-full text-sm lg:w-48">
            <SelectValue>
              {STATUS_OPTIONS.find((o) => o.value === status)?.label ??
                "All statuses"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs"
          disabled={exportMutation.isPending}
          onClick={handleExport}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
          {exportMutation.isPending ? "Preparing…" : "Export CSV"}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No donations match"
          description="Try clearing the filters."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/80 text-[11px] tracking-wider text-secondary uppercase dark:bg-foreground">
                  <th className="px-4 py-2.5 font-medium">Donor</th>
                  <th className="px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Receipt</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    tabIndex={0}
                    onClick={() => setSelectedId(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedId(r.id)
                      }
                    }}
                    className="cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                  >
                    <td className="px-4 py-3">
                      <p className="text-foreground">
                        {r.isAnonymous ? "Anonymous" : (r.donorName ?? "—")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.donorEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-foreground tabular-nums">
                      {fmtMoney(r.amount, r.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                          STATUS_TONE[r.status] ?? "bg-muted"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.receiptIssuedAt ? (
                        <span className="text-xs text-green">Issued</span>
                      ) : r.status === "success" ? (
                        <span className="text-xs text-muted-foreground">
                          Pending
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {fmtDate(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              {rows.length} of {total} donation{total === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={offset === 0}
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={!hasMore}
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <DonationDetailDrawer
        donationId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string | number
  tone?: "default" | "warn"
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-semibold tabular-nums ${
          tone === "warn" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
