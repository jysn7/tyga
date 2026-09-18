"use client"

import Image from "next/image"
import { useState } from "react"
import { format } from "date-fns"
import { Pencil, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EditEventPanel } from "@/components/portals/admin/events/edit-event-panel"
import { EmptyState } from "@/components/portals/shared/empty-state"
import type { Event } from "@/lib/types"

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
}

function formatEventDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return "—"
  return format(d, "d MMM yyyy")
}

export function EventList({ events }: { events: Event[] }) {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  function handleEdit(event: Event) {
    setEditingEvent(event)
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events yet"
        description="Create your first event to get started."
      />
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border/60 bg-card">
        {/* Single header with count + column labels */}
        <div className="hidden grid-cols-12 gap-4 border-b border-border/60 px-4 py-3 text-[10px] font-medium tracking-wider text-muted-foreground uppercase md:grid">
          <div className="col-span-5 flex items-center gap-2">
            <span>Event</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold normal-case">
              {events.length}
            </span>
          </div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Registered</div>
          <div className="col-span-1">Fee</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/60">
          {events.map((event) => (
            <div
              key={event.id}
              className="grid grid-cols-1 gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 md:grid-cols-12 md:items-center md:gap-4"
            >
              {/* Event: image + name + venue */}
              <div className="flex items-center gap-3 md:col-span-5">
                <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-muted/60">
                  {event.imageUrl && (
                    <Image
                      src={event.imageUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {event.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {event.venueName}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-muted-foreground md:col-span-2">
                {formatEventDate(event.eventDate)}
              </div>

              {/* Registered */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground md:col-span-2">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {event.registeredCount}
                  {event.capacity ? ` / ${event.capacity}` : ""}
                </span>
              </div>

              {/* Fee */}
              <div className="text-sm text-muted-foreground md:col-span-1">
                {Number(event.entryFee) > 0 ? `R${event.entryFee}` : "Free"}
              </div>

              {/* Status */}
              <div className="md:col-span-1">
                <Badge
                  variant="outline"
                  className={`rounded-full border-none px-2.5 py-0.5 text-[10px] font-medium ${statusStyles[event.status] ?? ""}`}
                >
                  {event.status}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex justify-end md:col-span-1">
                <button
                  onClick={() => handleEdit(event)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  title="Edit event"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditEventPanel
        event={editingEvent}
        open={editingEvent !== null}
        onOpenChange={(open) => !open && setEditingEvent(null)}
      />
    </>
  )
}
