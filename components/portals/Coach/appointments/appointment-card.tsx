"use client"

import type {
  CoachAppointmentItem,
  CoachAppointmentStatus,
} from "@/hooks/coach/use-appointments"
import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/portals/shared/form-styles"

const STATUS_STYLES: Record<CoachAppointmentStatus, string> = {
  requested: "bg-amber-100 text-amber-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  no_show: "bg-red-100 text-red-800",
}

const STATUS_LABELS: Record<CoachAppointmentStatus, string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

type AppointmentCardProps = {
  appointment: CoachAppointmentItem
  isClaiming: boolean
  onClaim: (appointmentId: number) => void
  onRecord: (appointment: CoachAppointmentItem) => void
}

export function AppointmentCard({
  appointment,
  isClaiming,
  onClaim,
  onRecord,
}: AppointmentCardProps) {
  const isOpen =
    appointment.status === "requested" || appointment.status === "scheduled"
  const isAssessment = appointment.type === "assessment"

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{appointment.memberName}</p>
          <p className="text-sm text-muted-foreground">
            Age {appointment.memberAge} at {appointment.venueName}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[appointment.status]}`}
        >
          {STATUS_LABELS[appointment.status]}
        </span>
      </div>

      <dl className="mt-3 space-y-1 text-sm">
        <div>
          <dt className="inline text-muted-foreground">
            {appointment.scheduledAt ? "Scheduled for: " : "Requested on: "}
          </dt>
          <dd className="inline">
            {formatDateTime(appointment.scheduledAt ?? appointment.requestedAt)}
          </dd>
        </div>
        {isAssessment && appointment.reportedSkillLevel && (
          <div>
            <dt className="inline text-muted-foreground">Parent says skill level: </dt>
            <dd className="inline">{appointment.reportedSkillLevel}</dd>
          </div>
        )}
        {appointment.assessedLevelName && (
          <div>
            <dt className="inline text-muted-foreground">Assessed level: </dt>
            <dd className="inline">{appointment.assessedLevelName}</dd>
          </div>
        )}
        {appointment.notes && (
          <p className="whitespace-pre-line pt-1 text-muted-foreground">
            {appointment.notes}
          </p>
        )}
      </dl>

      {isOpen && (
        <div className="mt-4">
          {appointment.isUnclaimed ? (
            <button
              type="button"
              className={primaryButtonClass}
              disabled={isClaiming}
              onClick={() => onClaim(appointment.id)}
            >
              {isClaiming ? "Claiming..." : "Claim this assessment"}
            </button>
          ) : (
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => onRecord(appointment)}
            >
              {isAssessment ? "Record assessment" : "Record consultation"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
