"use client"

import { SidePanel } from "@/components/portals/shared/side-sheet"
import { dotColor } from "@/lib/schedule"
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border py-3 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}

function statusLabel(status: SessionEvent["status"]) {
  if (status === "completed") return "Completed"
  if (status === "cancelled") return "Cancelled"
  return "Scheduled"
}

function attendanceLabel(status: SessionEvent["attendanceStatus"]) {
  if (status === "present") return "Present"
  if (status === "absent") return "Absent"
  if (status === "late") return "Late"
  if (status === "excused") return "Excused"
  return "—"
}

export function SessionDetailPanel({
  session,
  open,
  onOpenChange,
}: {
  session: SessionEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!session) return null

  const formattedDate = new Date(session.date).toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title={session.programmeName}
      description={`${formattedDate}, ${session.startTime}–${session.endTime}`}
    >
      <div className="flex flex-col">
        <Field label="Status">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span
              className={`h-1.5 w-1.5 rounded-full ${dotColor(session.status)}`}
            />
            {statusLabel(session.status)}
          </div>
        </Field>

        <Field label="Member">
          <span className="text-sm text-foreground">{session.memberName}</span>
        </Field>

        <Field label="Venue">
          <span className="text-sm text-foreground">{session.venueName}</span>
        </Field>

        {session.status === "completed" && (
          <Field label="Attendance">
            <span className="text-sm text-foreground">
              {attendanceLabel(session.attendanceStatus)}
            </span>
          </Field>
        )}

        {session.curriculumCovered.length > 0 && (
          <Field label="What was covered">
            <ul className="flex flex-col gap-1.5">
              {session.curriculumCovered.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  {item}
                </li>
              ))}
            </ul>
          </Field>
        )}

        <Field label="Coach notes">
          {session.coachNotes ? (
            <p className="text-sm leading-relaxed text-foreground">
              {session.coachNotes}
            </p>
          ) : (
            <span className="text-sm text-muted-foreground">
              {session.status === "completed"
                ? "No notes posted for this session."
                : "Notes will appear after the session."}
            </span>
          )}
        </Field>
      </div>
    </SidePanel>
  )
}
