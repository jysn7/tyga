"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarDays, Clock, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import type { ScheduleEntry } from "@/hooks/shared/use-schedule"
import { ConfirmAppointmentDialog } from "@/components/portals/admin/appointments/confirm-appointment-dialog"

type StatusFilter =
  "all" | "requested" | "scheduled" | "completed" | "cancelled" | "no_show"

function statusVariant(status: string): StatusVariant {
  switch (status) {
    case "requested":
      return "warning"
    case "scheduled":
      return "success"
    case "completed":
      return "neutral"
    case "cancelled":
      return "danger"
    case "no_show":
      return "danger"
    default:
      return "neutral"
  }
}

export function AppointmentsList({
  appointments,
  statusFilter,
  isLoading,
  error,
}: {
  appointments: ScheduleEntry[]
  statusFilter: StatusFilter
  isLoading: boolean
  error: Error | null
}) {
  const [confirming, setConfirming] = useState<ScheduleEntry | null>(null)

  const filtered = useMemo(() => {
    if (statusFilter === "all") return appointments
    return appointments.filter((a) => a.status === statusFilter)
  }, [appointments, statusFilter])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [filtered]
  )

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
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

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="No appointments"
        description={
          statusFilter === "all"
            ? "Appointments will appear here once parents start booking."
            : `No ${statusFilter.replace(/_/g, " ")} appointments.`
        }
      />
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-card shadow">
        <div className="flex flex-col divide-y divide-border/60">
          {sorted.map((appt) => (
            <AppointmentRow
              key={appt.id}
              appt={appt}
              onConfirm={() => setConfirming(appt)}
            />
          ))}
        </div>
      </div>

      {confirming && (
        <ConfirmAppointmentDialog
          appointment={confirming}
          open={true}
          onOpenChange={(open) => !open && setConfirming(null)}
        />
      )}
    </>
  )
}

function AppointmentRow({
  appt,
  onConfirm,
}: {
  appt: ScheduleEntry
  onConfirm: () => void
}) {
  const when = new Date(appt.startsAt)
  const canConfirm = appt.status === "requested"

  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {appt.title}
          </span>
          <StatusPill
            label={appt.status.replace(/_/g, " ")}
            variant={statusVariant(appt.status)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" strokeWidth={1.75} />
            {format(when, "EEE d MMM yyyy")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" strokeWidth={1.75} />
            {format(when, "HH:mm")}
          </span>
          {appt.subtitle && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3" strokeWidth={1.75} />
              {appt.subtitle}
            </span>
          )}
        </div>
      </div>

      {canConfirm && (
        <Button onClick={onConfirm} size="sm" className="h-8 shrink-0 text-xs">
          <User className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
          Confirm
        </Button>
      )}
    </div>
  )
}
