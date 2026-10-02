"use client"

import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import type { OpenSlot } from "@/hooks/client/use-parent-appointments"

export function MonthGrid({
  anchor,
  slotsByDay,
  onSelectSlot,
}: {
  anchor: Date
  slotsByDay: Map<string, OpenSlot[]>
  onSelectSlot: (slot: OpenSlot) => void
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
          const daySlots = slotsByDay.get(key) ?? []
          const isToday = isSameDay(day, today)
          const inMonth = isSameMonth(day, anchor)

          return (
            <div
              key={key}
              className={`flex min-h-[112px] flex-col gap-1 border-r border-b border-border/60 p-2 [&:nth-child(7n)]:border-r-0 ${
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
                {daySlots.length > 0 && (
                  <span className="rounded-sm bg-green-light px-1.5 py-0.5 text-[9px] font-medium text-secondary">
                    {daySlots.length}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                {daySlots.slice(0, 2).map((slot) => (
                  <button
                    key={slot.slotId}
                    onClick={() => onSelectSlot(slot)}
                    className="truncate rounded bg-teal/60 px-1.5 py-0.5 text-left text-[10px] text-primary-foreground transition-colors hover:bg-muted"
                  >
                    {format(new Date(slot.startsAt), "HH:mm")}
                  </button>
                ))}
                {daySlots.length > 2 && (
                  <button
                    onClick={() => onSelectSlot(daySlots[0])}
                    className="rounded px-1.5 py-0.5 text-left text-[9px] font-medium text-muted-foreground hover:bg-muted"
                  >
                    +{daySlots.length - 2} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
