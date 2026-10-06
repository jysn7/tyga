"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useInvoices } from "@/hooks/client/use-invoices"
import { InvoiceList } from "@/components/portals/client/invoices/invoice-list"

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
] as const

type StatusFilter = (typeof STATUS_OPTIONS)[number]["value"]

export function InvoicesTab() {
  const [status, setStatus] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")

  const {
    data: invoices,
    isLoading,
    error,
  } = useInvoices(status === "all" ? undefined : status)

  const normalizedSearch = search.trim().toLowerCase()
  const filtered = normalizedSearch
    ? (invoices ?? []).filter((inv) => {
        const number = String(inv.id).padStart(5, "0")
        return (
          number.includes(normalizedSearch) ||
          inv.status.toLowerCase().includes(normalizedSearch)
        )
      })
    : (invoices ?? [])

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invoice #"
          className="h-9 w-full text-sm sm:w-56"
        />
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="flex flex-col divide-y divide-border/60">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="ml-auto h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
            strokeWidth={1.75}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Failed to load invoices. Please try again.
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && !error && <InvoiceList invoices={filtered} />}
    </div>
  )
}
