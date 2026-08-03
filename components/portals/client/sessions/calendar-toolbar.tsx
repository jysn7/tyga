"use client"

import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import type { ViewMode } from "@/lib/schedule"

export function CalendarToolbar({
  view,
  headerLabel,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onExport,
}: {
  view: ViewMode
  headerLabel: string
  onViewChange: (view: ViewMode) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onExport?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-between md:flex-row">
      <div className="mb-2 flex items-center gap-3 md:mb-0">
        {view !== "list" && (
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNext}
              className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
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
            className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Today
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded-md bg-muted p-0.5">
          {(["month", "week", "list"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`cursor-pointer rounded px-3 py-1 text-sm capitalize transition-colors ${
                view === v
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {onExport && (
          <button
            onClick={onExport}
            title="Export schedule as CSV"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
