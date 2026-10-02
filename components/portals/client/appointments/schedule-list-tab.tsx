"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import type { ScheduleEntry } from "@/hooks/shared/use-schedule"

const PAGE_SIZE = 20

function statusVariant(status: string): StatusVariant {
  switch (status) {
    case "scheduled":
    case "active":
      return "success"
    case "requested":
    case "pending":
      return "warning"
    case "cancelled":
    case "no_show":
      return "danger"
    case "completed":
      return "neutral"
    default:
      return "neutral"
  }
}

export function ScheduleListTab({
  entries,
  onSelect,
}: {
  entries: ScheduleEntry[]
  onSelect?: (entry: ScheduleEntry) => void
}) {
  const [page, setPage] = useState(0)

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [entries]
  )

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const pageEntries = sorted.slice(start, start + PAGE_SIZE)

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl bg-card shadow">
        <div className="flex flex-col divide-y divide-border/60">
          {pageEntries.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onSelect?.(e)}
              className="flex items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-accent/40"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarDays
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  {format(new Date(e.startsAt), "EEE d MMM yyyy")}
                  <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                    <Clock className="h-3 w-3" strokeWidth={1.75} />
                    {format(new Date(e.startsAt), "HH:mm")}
                  </span>
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {e.title}
                  {e.subtitle ? ` · ${e.subtitle}` : ""}
                </span>
              </div>
              <StatusPill
                label={e.status.replace(/_/g, " ")}
                variant={statusVariant(e.status)}
              />
            </button>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages} · {sorted.length} total
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
