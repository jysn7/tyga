"use client"

import { format } from "date-fns"
import { CalendarDays, Clock, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { ScheduleEntry } from "@/hooks/shared/use-schedule"

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
}

export function EntryDetailSheet({
  entry,
  open,
  onOpenChange,
}: {
  entry: ScheduleEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isAppointment = entry.kind === "appointment"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{entry.title}</DialogTitle>
          <DialogDescription>
            {isAppointment ? "Appointment" : "Programme session"} ·{" "}
            {STATUS_LABEL[entry.status] ?? entry.status}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2 text-sm">
          <div className="flex items-start gap-2">
            <CalendarDays
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
            <span className="text-foreground">
              {format(new Date(entry.startsAt), "EEEE d MMMM yyyy")}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Clock
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
            <span className="text-foreground">
              {format(new Date(entry.startsAt), "HH:mm")} –{" "}
              {format(new Date(entry.endsAt), "HH:mm")}
            </span>
          </div>
          {entry.subtitle && (
            <div className="flex items-start gap-2">
              <MapPin
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span className="text-muted-foreground">{entry.subtitle}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
