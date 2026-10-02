"use client"

import { useMemo, useState } from "react"
import {
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ScheduleEntry } from "@/hooks/shared/use-schedule"
import { WeekGrid } from "@/components/portals/client/appointments/week-grid"
import { MonthGrid } from "@/components/portals/client/appointments/month-grid"
import { ScheduleListTab } from "@/components/portals/client/appointments/schedule-list-tab"

type ViewMode = "week" | "month" | "list"

export type ScheduleFilter = {
  key: string
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function SchedulePage({
  entries,
  isLoading,
  error,
  filters,
}: {
  entries: ScheduleEntry[] | undefined
  isLoading: boolean
  error: Error | null
  filters?: ScheduleFilter[]
}) {
  const [view, setView] = useState<ViewMode>("week")
  const [anchor, setAnchor] = useState<Date>(new Date())

  const slotsByDay = useMemo(() => {
    const map = new Map<string, ReturnType<typeof toGridSlot>[]>()
    for (const e of entries ?? []) {
      const key = format(new Date(e.startsAt), "yyyy-MM-dd")
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(toGridSlot(e))
    }
    return map
  }, [entries])

  function goPrev() {
    setAnchor((d) => (view === "week" ? subWeeks(d, 1) : subMonths(d, 1)))
  }
  function goNext() {
    setAnchor((d) => (view === "week" ? addWeeks(d, 1) : addMonths(d, 1)))
  }
  function goToday() {
    setAnchor(new Date())
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filter + view toggle + navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {filters?.map((f) => (
            <Select
              key={f.key}
              value={f.value}
              onValueChange={(v) => f.onChange(v ?? "all")}
            >
              <SelectTrigger className="h-9 w-full text-sm sm:w-44">
                <SelectValue placeholder={f.label}>
                  {f.options.find((o) => o.value === f.value)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border p-0.5">
            <button
              onClick={() => setView("week")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "week"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "month"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "list"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              List
            </button>
          </div>

          {view !== "list" && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goPrev}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToday}
                className="h-8 px-2.5 text-xs"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Period label — only for calendar views */}
      {view !== "list" && (
        <div className="text-sm font-medium text-foreground">
          {view === "week"
            ? `${format(
                startOfWeek(anchor, { weekStartsOn: 1 }),
                "d MMM"
              )} – ${format(
                endOfWeek(anchor, { weekStartsOn: 1 }),
                "d MMM yyyy"
              )}`
            : format(anchor, "MMMM yyyy")}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      ) : !entries || entries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nothing scheduled"
          description="Programme sessions and appointments appear here."
        />
      ) : view === "week" ? (
        <WeekGrid
          anchor={anchor}
          slotsByDay={slotsByDay}
          onSelectSlot={() => {}}
        />
      ) : view === "month" ? (
        <MonthGrid
          anchor={anchor}
          slotsByDay={slotsByDay}
          onSelectSlot={() => {}}
        />
      ) : (
        <ScheduleListTab entries={entries ?? []} />
      )}
    </div>
  )
}

// ---------- Adapter ----------

function toGridSlot(entry: ScheduleEntry) {
  return {
    slotId: Number(entry.id.replace(/^\D+/, "")),
    startsAt: entry.startsAt,
    endsAt: entry.endsAt,
    venueId: 0,
    venueName: entry.subtitle,
    levelId: null,
    levelName: null,
    coachId: null,
    coachName: null,
    capacity: 1,
    booked: 0,
    remaining: 1,
    notes: null,
  }
}
