"use client"

import Link from "next/link"
import { dotColor, type EventKind } from "@/lib/schedule"
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

const KIND_STYLE: Record<EventKind, string> = {
  session: "bg-blue text-primary-foreground",
  appointment: "bg-amber-500/25 text-foreground",
}

export function SessionPill({
  session,
  href,
}: {
  session: SessionEvent
  href: string | null
}) {
  // Falls back to the session colour if kind is missing
  const kindStyle = KIND_STYLE[session.kind] ?? KIND_STYLE.session

  const className = `flex w-full items-center gap-1.5 truncate rounded-lg px-1.5 py-1 text-left text-xs transition-colors ${kindStyle} ${
    href ? "hover:bg-accent/40 hover:text-foreground" : ""
  } ${session.status === "cancelled" ? "line-through opacity-60" : ""}`

  const content = (
    <>
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(session.status)}`}
      />
      <span className="truncate">
        {session.startTime} · {session.memberName || session.programmeName}
      </span>
    </>
  )

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  )
}
