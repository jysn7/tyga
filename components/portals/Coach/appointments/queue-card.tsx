"use client"

import { format } from "date-fns"
import {
  CalendarDays,
  MapPin,
  Layers,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/portals/shared/status-pill"
import type { HeadCoachAppointment } from "@/hooks/coach/use-head-coach-appointments"

export function QueueCard({
  appt,
  onConfirm,
  onComplete,
  onNoShow,
  isPending,
}: {
  appt: HeadCoachAppointment
  onConfirm: () => void
  onComplete: () => void
  onNoShow: () => void
  isPending: boolean
}) {
  const when = appt.scheduledAt ?? appt.slotStartsAt
  const isRequested = appt.status === "requested"

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {appt.memberName}
          </span>
          <StatusPill
            label={isRequested ? "Requested" : "Scheduled"}
            variant={isRequested ? "warning" : "success"}
          />
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
          {appt.coachName && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" strokeWidth={1.75} />
              {appt.coachName}
            </span>
          )}
        </div>

        {appt.notes && (
          <p className="text-xs text-muted-foreground">{appt.notes}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isRequested && (
          <Button onClick={onConfirm} size="sm" className="h-8 gap-1 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Confirm
          </Button>
        )}

        {appt.status === "scheduled" && (
          <>
            <Button
              onClick={onComplete}
              size="sm"
              className="h-8 gap-1 text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Complete
            </Button>
            <Button
              onClick={onNoShow}
              disabled={isPending}
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
            >
              <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
              No-show
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
