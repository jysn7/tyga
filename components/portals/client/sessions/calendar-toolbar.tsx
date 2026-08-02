"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ViewMode } from "@/lib/schedule"

export function CalendarToolbar({
  view,
  headerLabel,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: {
  view: ViewMode
  headerLabel: string
  onViewChange: (view: ViewMode) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {view !== "list" && (
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNext}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        <span className="text-[15px] font-medium text-foreground">
          {headerLabel}
        </span>
        {view !== "list" && (
          <button
            onClick={onToday}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Today
          </button>
        )}
      </div>

      <div className="flex gap-1 rounded-md bg-muted p-0.5">
        {(["month", "week", "list"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`rounded px-3 py-1 text-sm capitalize transition-colors ${
              view === v
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
