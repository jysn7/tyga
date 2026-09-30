"use client"

import { format } from "date-fns"
import { Clock, MapPin, Layers, Users, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/portals/shared/status-pill"
import type { CoachSlot } from "@/hooks/coach/use-coach-appointments"

export function SlotRow({
  slot,
  onArchive,
}: {
  slot: CoachSlot
  onArchive: () => void
}) {
  const isFull = slot.booked >= slot.capacity
  const isArchived = slot.archivedAt !== null

  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {format(new Date(slot.startsAt), "EEE d MMM")}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" strokeWidth={1.75} />
            {format(new Date(slot.startsAt), "HH:mm")} –{" "}
            {format(new Date(slot.endsAt), "HH:mm")}
          </span>

          {isArchived ? (
            <StatusPill label="Archived" variant="neutral" />
          ) : isFull ? (
            <StatusPill label="Full" variant="danger" />
          ) : (
            <StatusPill label={`${slot.remaining} open`} variant="success" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" strokeWidth={1.75} />
            {slot.venueName}
          </span>
          {slot.levelName && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" strokeWidth={1.75} />
              {slot.levelName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" strokeWidth={1.75} />
            {slot.booked} / {slot.capacity}
          </span>
        </div>
      </div>

      {!isArchived && (
        <Button
          variant="outline"
          size="sm"
          onClick={onArchive}
          className="h-8 shrink-0 gap-1 text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Archive
        </Button>
      )}
    </div>
  )
}
