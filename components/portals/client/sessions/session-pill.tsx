"use client"

import { dotColor } from "@/lib/schedule"
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

export function SessionPill({
  session,
  onClick,
}: {
  session: SessionEvent
  onClick: () => void
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="flex w-full items-center gap-1.5 truncate rounded bg-blue px-1.5 py-2 text-left text-xs text-primary-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(session.status)}`}
      />
      <span className="truncate">
        {session.startTime} · {session.memberName}
      </span>
    </button>
  )
}
