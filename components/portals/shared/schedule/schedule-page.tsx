"use client"

import { useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ScheduleEntry } from "@/hooks/shared/use-schedule"
import { EntryDetailSheet } from "./entry-detail-sheet"

const KIND_STYLES: Record<ScheduleEntry["kind"], string> = {
  programme_session:
    "bg-blue-light text-primary-foreground dark:text-foreground",
  appointment: "bg-orange-light text-primary-foreground dark:text-foreground",
}

export type ScheduleFilter = {
  key: string
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function SchedulePage({
  title,
  description,
  entries,
  isLoading,
  error,
  filters,
}: {
  title: string
  description: string
  entries: ScheduleEntry[] | undefined
  isLoading: boolean
  error: Error | null
  filters?: ScheduleFilter[]
}) {
  const [view, setView] = useState<"week" | "month">("week")
  const [anchor, setAnchor] = useState<Date>(new Date())
  const [selected, setSelected] = useState<ScheduleEntry | null>(null)

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>()
    for (const e of entries ?? []) {
      const key = format(new Date(e.startsAt), "yyyy-MM-dd")
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
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
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {filters?.map((f) => (
            <Select
              key={f.key}
              value={f.value}
              onValueChange={(v) => f.onChange(v ?? "")}
            >
              <SelectTrigger className="h-9 w-full text-sm sm:w-44">
                <SelectValue placeholder={f.label} />
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
                  ? "bg-foreground/80 text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                view === "month"
                  ? "bg-foreground/80 text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
          </div>

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
        </div>
      </div>

      {/* Period + legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium text-foreground">
          {view === "week"
            ? `${format(startOfWeek(anchor, { weekStartsOn: 1 }), "d MMM")} – ${format(
                endOfWeek(anchor, { weekStartsOn: 1 }),
                "d MMM yyyy"
              )}`
            : format(anchor, "MMMM yyyy")}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-light" />
            Programme
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-orange-light" />
            Appointment
          </span>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      ) : !entries || entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
            <CalendarDays
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              Nothing scheduled
            </span>
            <span className="text-xs text-muted-foreground">
              Programme sessions and appointments appear here.
            </span>
          </div>
        </div>
      ) : view === "week" ? (
        <WeekView anchor={anchor} byDay={byDay} onSelect={setSelected} />
      ) : (
        <MonthView anchor={anchor} byDay={byDay} onSelect={setSelected} />
      )}

      {selected && (
        <EntryDetailSheet
          entry={selected}
          open={true}
          onOpenChange={(open) => !open && setSelected(null)}
        />
      )}
    </div>
  )
}

function WeekView({
  anchor,
  byDay,
  onSelect,
}: {
  anchor: Date
  byDay: Map<string, ScheduleEntry[]>
  onSelect: (entry: ScheduleEntry) => void
}) {
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd")
        const dayEntries = byDay.get(key) ?? []
        const isToday = isSameDay(day, today)

        return (
          <div
            key={key}
            className={`flex flex-col gap-2 rounded-xl border p-3 shadow-sm ${
              isToday
                ? "border-foreground/20 bg-card"
                : "border-border/60 bg-card"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                {format(day, "EEE")}
              </span>
              <span className="text-lg leading-none font-semibold text-foreground/80">
                {format(day, "d")}
              </span>
            </div>

            {dayEntries.length === 0 ? (
              <div className="mt-1 flex h-16 items-center justify-center rounded-md bg-muted/30">
                <span className="text-[10px] text-muted-foreground">—</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {dayEntries.slice(0, 5).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onSelect(e)}
                    className={`flex flex-col gap-0.5 rounded-md px-2 py-1.5 text-left transition-opacity hover:opacity-90 ${KIND_STYLES[e.kind]}`}
                  >
                    <span className="text-[11px] font-medium tabular-nums">
                      {format(new Date(e.startsAt), "HH:mm")}
                    </span>
                    <span className="truncate text-[10px] font-medium">
                      {e.title}
                    </span>
                    <span className="truncate text-[10px] opacity-80">
                      {e.subtitle}
                    </span>
                  </button>
                ))}
                {dayEntries.length > 5 && (
                  <span className="px-2 py-1 text-[10px] font-medium text-muted-foreground">
                    +{dayEntries.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MonthView({
  anchor,
  byDay,
  onSelect,
}: {
  anchor: Date
  byDay: Map<string, ScheduleEntry[]>
  onSelect: (entry: ScheduleEntry) => void
}) {
  const monthStart = startOfMonth(anchor)
  const monthEnd = endOfMonth(anchor)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let cursor = gridStart
  while (cursor <= gridEnd) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }

  const today = new Date()

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow">
      <div className="grid grid-cols-7 border-b border-border/60 bg-muted/20">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const dayEntries = byDay.get(key) ?? []
          const isToday = isSameDay(day, today)
          const inMonth = isSameMonth(day, anchor)

          return (
            <div
              key={key}
              className={`flex min-h-[120px] flex-col gap-1 border-r border-b border-border/60 p-2 [&:nth-child(7n)]:border-r-0 ${
                inMonth ? "" : "bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-medium ${
                    isToday
                      ? "flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
                      : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayEntries.length > 0 && (
                  <span className="rounded-sm bg-input px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                    {dayEntries.length}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                {dayEntries.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onSelect(e)}
                    className={`truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium transition-opacity hover:opacity-90 ${KIND_STYLES[e.kind]}`}
                  >
                    {format(new Date(e.startsAt), "HH:mm")} {e.title}
                  </button>
                ))}
                {dayEntries.length > 3 && (
                  <span className="px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                    +{dayEntries.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
