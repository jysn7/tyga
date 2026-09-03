"use client"

import { ChevronLeft, ChevronRight, Database } from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AuditRow, type AuditEntry } from "./audit-row"

export function AuditList({
  entries,
  page,
  pageSize,
  onPageChange,
  onSelect,
}: {
  entries: AuditEntry[]
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onSelect: (entry: AuditEntry) => void
}) {
  // We don't know the true total count from the RPC (it only returns the
  // current page), so "next" just stays enabled as long as this page was
  // full — a full page means there's likely more.
  const hasNextPage = entries.length === pageSize

  if (entries.length === 0 && page === 0) {
    return (
      <EmptyState
        icon={Database}
        title="No audit log entries found"
        description="Try adjusting your filters."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg bg-card shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Record</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <AuditRow key={entry.id} entry={entry} onSelect={onSelect} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          Page {page + 1} · {entries.length} entries shown
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
