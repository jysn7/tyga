"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarDays, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import {
  useParentAppointments,
  useCancelAppointment,
  type ParentAppointment,
} from "@/hooks/client/use-parent-appointments"
import { useBehaviourSettings } from "@/hooks/lookups/use-academy-settings"
import { CancelDialog } from "./cancel-dialog"

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

export function MyAppointmentsTab() {
  const { data: appointments, isLoading } = useParentAppointments()
  const { cancellationCutoffHours: cutoffHours } = useBehaviourSettings()
  const cancel = useCancelAppointment()
  const [cancelling, setCancelling] = useState<ParentAppointment | null>(null)

  const cutoffTime = useMemo(() => {
    const now = new Date()
    now.setHours(now.getHours() + cutoffHours)
    return now
  }, [cutoffHours])

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }

  if (!appointments || appointments.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No appointments yet"
        description="Browse open slots to book one."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {appointments.map((appt) => (
        <AppointmentCard
          key={appt.id}
          appt={appt}
          cutoffTime={cutoffTime}
          onCancel={() => setCancelling(appt)}
        />
      ))}

      {cancelling && (
        <CancelDialog
          appointment={cancelling}
          open={true}
          onOpenChange={(open) => !open && setCancelling(null)}
          onConfirm={(reason) => {
            cancel.mutate(
              { appointmentId: cancelling.id, reason },
              {
                onSuccess: () => {
                  toast.add({
                    title: "Appointment cancelled",
                    type: "success",
                    timeout: 3000,
                  })
                  setCancelling(null)
                },
                onError: (err) =>
                  toast.add({
                    title: "Failed to cancel",
                    description:
                      err instanceof Error
                        ? err.message
                        : "Something went wrong",
                    type: "error",
                    timeout: 5000,
                  }),
              }
            )
          }}
          isPending={cancel.isPending}
        />
      )}
    </div>
  )
}

function AppointmentCard({
  appt,
  cutoffTime,
  onCancel,
}: {
  appt: ParentAppointment
  cutoffTime: Date
  onCancel: () => void
}) {
  const when = appt.scheduledAt ?? appt.slotStartsAt
  const appointmentTime = when ? new Date(when) : null

  const isInsideCutoff =
    appointmentTime !== null && appointmentTime < cutoffTime

  const cancellable = appt.status === "requested" || appt.status === "scheduled"
  const canCancel = cancellable && !isInsideCutoff

  const { label, variant } = statusMeta(appt.status)

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
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
          {appt.coachName && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" strokeWidth={1.75} />
              {appt.coachName}
            </span>
          )}
        </div>
      </div>

      {canCancel && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="h-8 shrink-0 text-xs"
        >
          Cancel
        </Button>
      )}

      {cancellable && isInsideCutoff && (
        <span className="text-[11px] text-muted-foreground">
          Contact the academy to change
        </span>
      )}
    </div>
  )
}
