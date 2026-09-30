"use client"

import { format } from "date-fns"
import { CalendarDays, MapPin, Layers, Users } from "lucide-react"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import { useCoachBookedAppointments } from "@/hooks/coach/use-coach-appointments"

function statusMeta(status: string): {
  label: string
  variant: StatusVariant
} {
  switch (status) {
    case "requested":
      return { label: "Requested", variant: "warning" }
    case "scheduled":
      return { label: "Scheduled", variant: "success" }
    case "completed":
      return { label: "Completed", variant: "neutral" }
    case "cancelled":
      return { label: "Cancelled", variant: "danger" }
    case "no_show":
      return { label: "No show", variant: "danger" }
    default:
      return { label: status, variant: "neutral" }
  }
}

export function BookedTab() {
  const { data: appointments, isLoading, error } = useCoachBookedAppointments()

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error.message}
      </div>
    )
  }

  if (!appointments || appointments.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No bookings yet"
        description="When parents book your slots, they'll appear here."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow">
      <div className="flex flex-col divide-y divide-border/60">
        {appointments.map((appt) => {
          const when = appt.scheduledAt ?? appt.slotStartsAt
          const { label, variant } = statusMeta(appt.status)

          return (
            <div key={appt.id} className="flex flex-col gap-2 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {appt.memberName}
                </span>
                <StatusPill label={label} variant={variant} />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {when && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" strokeWidth={1.75} />
                    {format(new Date(when), "EEE d MMM, HH:mm")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" strokeWidth={1.75} />
                  {appt.venueName}
                </span>
                {appt.levelName && (
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" strokeWidth={1.75} />
                    {appt.levelName}
                  </span>
                )}
              </div>
              {appt.notes && (
                <p className="text-xs text-muted-foreground">{appt.notes}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
