"use client"

import { useMemo, useState } from "react"
import {
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useOpenSlots,
  type OpenSlot,
} from "@/hooks/client/use-parent-appointments"
import { useLevels } from "@/hooks/lookups/use-lookups"
import { useBehaviourSettings } from "@/hooks/lookups/use-academy-settings"
import { WeekGrid } from "@/components/portals/client/appointments/week-grid"
import { MonthGrid } from "@/components/portals/client/appointments/month-grid"
import { BookSlotDialog } from "@/components/portals/client/appointments/book-slot-dialog"

type ViewMode = "week" | "month"

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium w-fit text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial"

export function BrowseSlotsTab() {
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [view, setView] = useState<ViewMode>("month")
  const [anchor, setAnchor] = useState<Date>(new Date())
  const [bookingSlot, setBookingSlot] = useState<OpenSlot | null>(null)

  const { data: levels } = useLevels()
  const { bookingLeadHours: leadHours, bookingLookaheadDays: lookaheadDays } =
    useBehaviourSettings()
  const levelId = levelFilter === "all" ? null : Number(levelFilter)

  const { from, to } = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(anchor, { weekStartsOn: 1 })
      const end = endOfWeek(anchor, { weekStartsOn: 1 })
      return { from: start.toISOString(), to: end.toISOString() }
    }
    const start = startOfMonth(anchor)
    const end = endOfMonth(anchor)
    const gridStart = startOfWeek(start, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(end, { weekStartsOn: 1 })
    return { from: gridStart.toISOString(), to: gridEnd.toISOString() }
  }, [view, anchor])

  const { data: slots, isLoading, error } = useOpenSlots(levelId, from, to)

  const slotsByDay = useMemo(() => {
    const map = new Map<string, OpenSlot[]>()
    for (const slot of slots ?? []) {
      const key = format(new Date(slot.startsAt), "yyyy-MM-dd")
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(slot)
    }
    return map
  }, [slots])

  function goPrev() {
    setAnchor((d) => (view === "week" ? subWeeks(d, 1) : subMonths(d, 1)))
  }
  function goNext() {
    setAnchor((d) => (view === "week" ? addWeeks(d, 1) : addMonths(d, 1)))
  }
  function goToday() {
    setAnchor(new Date())
  }

  const selectedLevelName =
    levelFilter === "all"
      ? "All levels"
      : levels?.find((l) => l.id.toString() === levelFilter)?.name

  return (
    <div className="flex flex-col gap-5">
      {/* Filter + view toggle + navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Level filter */}
        <Select
          value={levelFilter}
          onValueChange={(v) => setLevelFilter(v ?? "all")}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-44">
            <SelectValue placeholder="All levels">
              {selectedLevelName}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {(levels ?? []).map((l) => (
              <SelectItem key={l.id} value={l.id.toString()}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          {/* View tabs */}
          <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
            <TabsList className="h-auto gap-1 rounded-lg bg-input p-1">
              <TabsTrigger value="week" className={TAB_TRIGGER_CLASS}>
                Week
              </TabsTrigger>
              <TabsTrigger value="month" className={TAB_TRIGGER_CLASS}>
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              className="h-8 w-8 p-0"
              aria-label="Previous"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              className="h-8 w-8 p-0"
              aria-label="Next"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      </div>

      {/* Period label */}
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

      {/* Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Error loading slots: {error.message}
        </div>
      ) : !slots || slots.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No slots available"
          description={`Slots appear here ${leadHours} hours before they start and up to ${lookaheadDays} days ahead.`}
        />
      ) : view === "week" ? (
        <WeekGrid
          anchor={anchor}
          slotsByDay={slotsByDay}
          onSelectSlot={setBookingSlot}
        />
      ) : (
        <MonthGrid
          anchor={anchor}
          slotsByDay={slotsByDay}
          onSelectSlot={setBookingSlot}
        />
      )}

      {bookingSlot && (
        <BookSlotDialog
          slot={bookingSlot}
          open={true}
          onOpenChange={(open) => !open && setBookingSlot(null)}
        />
      )}
    </div>
  )
}
