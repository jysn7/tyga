"use client"

import { SidePanel } from "@/components/portals/shared/side-sheet"
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-neutral-100 py-3">
      <span className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}

function statusDotColor(status: SessionEvent["status"]) {
  if (status === "completed") return "bg-neutral-900"
  if (status === "cancelled") return "bg-neutral-300"
  return "bg-neutral-400"
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
          <div className="flex items-center gap-2 text-[15px] text-neutral-900">
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusDotColor(session.status)}`}
            />
            {statusLabel(session.status)}
          </div>
        </Field>

        <Field label="Member">
          <span className="text-[15px] text-neutral-900">
            {session.memberName}
          </span>
        </Field>

        <Field label="Venue">
          <span className="text-[15px] text-neutral-900">
            {session.venueName}
          </span>
        </Field>

        {session.status === "completed" && (
          <Field label="Attendance">
            <span className="text-[15px] text-neutral-900">
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
                  className="flex items-start gap-2 text-[15px] text-neutral-900"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-300" />
                  {item}
                </li>
              ))}
            </ul>
          </Field>
        )}

        <Field label="Coach notes">
          {session.coachNotes ? (
            <p className="text-[15px] leading-relaxed text-neutral-900">
              {session.coachNotes}
            </p>
          ) : (
            <span className="text-[15px] text-neutral-300">
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
