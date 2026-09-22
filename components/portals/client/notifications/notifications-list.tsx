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
    <div className="overflow-hidden rounded-xl bg-card shadow">
      <div className="flex flex-col divide-y divide-border/60">
        {items.map((n) => {
          const Icon = iconMap[n.relatedType] ?? Bell
          const isUnread = !n.readAt

          return (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className="group flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/40"
            >
              {/* Icon bubble */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isUnread ? "bg-primary/10" : "bg-input"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isUnread ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={1.75}
                />
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span
                  className={`truncate text-sm ${
                    isUnread
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {n.title}
                </span>
                <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {n.body}
                </span>
              </div>

              {/* Meta */}
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <span className="text-[11px] text-muted-foreground">
                  {formatRelativeDate(n.createdAt)}
                </span>
                {isUnread && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
