"use client"

import { useState } from "react"
import {
  Bell,
  Calendar,
  Receipt,
  TrendingUp,
  Users,
  Megaphone,
} from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"

export type NotificationItem = {
  id: string
  title: string
  body: string
  relatedType:
    "session" | "payment" | "level_progression" | "appointment" | "announcement"
  createdAt: string
  readAt: string | null
}

const iconMap: Record<NotificationItem["relatedType"], React.ElementType> = {
  session: Calendar,
  payment: Receipt,
  level_progression: TrendingUp,
  appointment: Users,
  announcement: Megaphone,
}

function formatRelativeDate(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  })
}

export function NotificationList({
  notifications,
}: {
  notifications: NotificationItem[]
}) {
  const [items, setItems] = useState(notifications)

  async function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n
      )
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No notifications yet"
        description="Reminders, payment alerts, and updates will show up here."
      />
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border">
      {items.map((n) => {
        const Icon = iconMap[n.relatedType] ?? Bell
        const isUnread = !n.readAt

        return (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-accent/30"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="truncate text-sm text-foreground">
                  {n.title}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  — {n.body}
                </span>
              </div>
            </div>

            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatRelativeDate(n.createdAt)}
            </span>

            {isUnread && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
