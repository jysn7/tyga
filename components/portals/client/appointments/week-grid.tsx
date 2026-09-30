"use client"

import { addDays, format, isSameDay, startOfWeek } from "date-fns"
import type { OpenSlot } from "@/hooks/client/use-parent-appointments"

export function WeekGrid({
  anchor,
  slotsByDay,
  onSelectSlot,
}: {
  anchor: Date
  slotsByDay: Map<string, OpenSlot[]>
  onSelectSlot: (slot: OpenSlot) => void
}) {
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd")
        const daySlots = slotsByDay.get(key) ?? []
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
              <span
                className={`text-lg leading-none font-semibold ${
                  isToday ? "text-foreground" : "text-foreground/80"
                }`}
              >
                {format(day, "d")}
              </span>
            </div>

            {daySlots.length === 0 ? (
              <div className="mt-1 flex h-16 items-center justify-center rounded-md bg-muted/30">
                <span className="text-[10px] text-muted-foreground">
                  No slots
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {daySlots.slice(0, 4).map((slot) => (
                  <button
                    key={slot.slotId}
                    onClick={() => onSelectSlot(slot)}
                    className="flex flex-col gap-0.5 rounded-md border border-border bg-blue-light px-2 py-1.5 text-left transition-colors hover:bg-muted"
                  >
                    <span className="text-[11px] font-medium text-foreground tabular-nums">
                      {format(new Date(slot.startsAt), "HH:mm")}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {slot.venueName}
                    </span>
                  </button>
                ))}
                {daySlots.length > 4 && (
                  <button
                    onClick={() => onSelectSlot(daySlots[0])}
                    className="rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted"
                  >
                    +{daySlots.length - 4} more
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
