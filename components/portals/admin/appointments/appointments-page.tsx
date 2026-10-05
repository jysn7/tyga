"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { AppointmentsList } from "@/components/portals/admin/appointments/appointments-list"
import { CreateSlotDialog } from "@/components/portals/admin/appointments/create-slot-dialog"
import { useAdminSchedule } from "@/hooks/shared/use-schedule"

type StatusFilter =
  "all" | "requested" | "scheduled" | "completed" | "cancelled" | "no_show"

// Computed once per app load, at module scope — not per render, not per
// mount. Snapped to day boundaries so the values never change mid-session.
const { FROM, TO } = (() => {
  const now = new Date()
  const start = new Date(now)
  start.setMonth(start.getMonth() - 3)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setMonth(end.getMonth() + 6)
  end.setHours(23, 59, 59, 999)
  return { FROM: start.toISOString(), TO: end.toISOString() }
})()

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export function AppointmentsPage() {
  const [status, setStatus] = useState<StatusFilter>("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(25)

  const { data, isLoading, error } = useAdminSchedule(FROM, TO)

  const appointments = useMemo(
    () => (data ?? []).filter((e) => e.kind === "appointment"),
    [data]
  )

  const total = appointments.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize
    return appointments.slice(startIdx, startIdx + pageSize)
  }, [appointments, currentPage, pageSize])

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, total)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as StatusFilter)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No show</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => setCreateOpen(true)}
          className="h-9 shrink-0 text-xs"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Open a slot
        </Button>
      </div>

      <AppointmentsList
        appointments={pageItems}
        statusFilter={status}
        isLoading={isLoading}
        error={error}
      />

      {total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Showing {rangeStart}–{rangeEnd} of {total}
            </span>
            <span className="hidden sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline">Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v) as PageSize)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-[70px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <CreateSlotDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  )
}
