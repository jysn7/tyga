// components/portals/client/notifications/notifications-list.tsx
"use client"

import Link from "next/link"
import {
  Bell,
  Calendar,
  Receipt,
  TrendingUp,
  Users,
  Megaphone,
  BookOpen,
  GraduationCap,
  AlertTriangle,
} from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { useMarkRead, type Notification } from "@/hooks/use-notifications"

const iconMap: Record<string, React.ElementType> = {
  // Sessions
  session: Calendar,
  session_reminder: Calendar,
  session_cancelled: Calendar,

  // Payments
  payment: Receipt,
  payment_confirmed: Receipt,
  payment_due: Receipt,

  // Levels
  level_progression: TrendingUp,
  level_upgrade: TrendingUp,

  // Appointments / assessments
  appointment: Users,
  appointment_confirmed: Users,
  appointment_completed: Users,
  appointment_reminder: Users,
  appointment_assigned: Users,
  assessment_assigned: Users,
  appointment_no_show: AlertTriangle,

  // People
  member: Users,
  member_added: Users,
  new_student: GraduationCap,
  enrollment: BookOpen,
  enrollment_confirmed: BookOpen,

  // Attendance
  attendance: Calendar,
  attendance_update: Calendar,

  // Announcements
  announcement: Megaphone,
  welcome: Bell,

  // Fallback
  default: Bell,
}

function iconFor(n: Notification): React.ElementType {
  if (n.type && iconMap[n.type]) return iconMap[n.type]
  if (n.relatedType && iconMap[n.relatedType]) return iconMap[n.relatedType]
  return Bell
}

function notificationHref(n: Notification): string | undefined {
  switch (n.relatedType) {
    case "member":
      return n.relatedId ? `/members/${n.relatedId}` : "/members"
    case "enrollment":
      return "/programmes"
    case "payment":
      return "/invoices"
    case "attendance":
      return "/dashboard"
    case "level_progression":
      return "/dashboard"
    case "session":
      return "/schedule"
    case "appointment":
      return "/my-appointments"
    default:
      return "/notifications"
  }
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
  notifications: Notification[]
}) {
  const markRead = useMarkRead()

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="Reminders, payment alerts, and updates will show up here."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow">
      <div className="flex flex-col divide-y divide-border/60">
        {notifications.map((n) => {
          const Icon = iconFor(n)
          const isUnread = !n.isRead
          const href = notificationHref(n)

          function handleClick() {
            if (isUnread) {
              markRead.mutate(n.id)
            }
          }

          const content = (
            <>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isUnread ? "border border-border bg-card" : "bg-input"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isUnread ? "text-muted-foreground" : "text-muted-foreground"
                  }`}
                  strokeWidth={1.75}
                />
              </div>

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

              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <span className="text-[11px] text-muted-foreground">
                  {formatRelativeDate(n.createdAt)}
                </span>
                {isUnread && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            </>
          )

          const className = `group flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/40`

          if (href) {
            return (
              <Link
                key={n.id}
                href={href}
                onClick={handleClick}
                className={className}
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={n.id}
              type="button"
              onClick={handleClick}
              className={className}
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}
