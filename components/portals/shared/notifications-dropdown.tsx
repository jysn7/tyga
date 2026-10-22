"use client"

import Link from "next/link"
import { Bell, Check, ChevronRight, Inbox } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  type Notification,
} from "@/hooks/use-notifications"

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
    case "gear_rental":
      return "/dashboard"
    default:
      return undefined
  }
}

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return ""
  }
}

export function NotificationsDropdown() {
  const { data: notifications = [], isLoading } = useNotifications(10, 0)
  const { data: unreadCount = 0 } = useUnreadCount()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const displayNotifications = notifications.slice(0, 4)
  const hasUnread = unreadCount > 0

  function handleItemClick(n: Notification) {
    if (!n.isRead) {
      markRead.mutate(n.id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title="Notifications"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {hasUnread && (
          <span
            aria-hidden
            className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] leading-none font-semibold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 py-2">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </span>
          {hasUnread && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <Check className="h-3 w-3" strokeWidth={1.75} />
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          </div>
        ) : displayNotifications.length > 0 ? (
          <DropdownMenuGroup className="flex flex-col divide-y divide-border/60">
            {displayNotifications.map((item) => {
              const content = (
                <div className="flex w-full items-center gap-2.5 px-3 py-2.5">
                  {!item.isRead && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate text-sm text-foreground">
                        {item.title}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.body}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {relativeTime(item.createdAt)}
                  </span>
                </div>
              )

              const href = notificationHref(item)

              return (
                <DropdownMenuItem
                  key={item.id}
                  className="cursor-pointer rounded-none p-0"
                  onSelect={() => handleItemClick(item)}
                >
                  {href ? (
                    <Link href={href} className="w-full">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Inbox
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.75}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              No notifications yet
            </p>
          </div>
        )}

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem className="cursor-pointer justify-center p-0">
          <Link
            href="/notifications"
            className="flex w-full items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View all notifications
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
