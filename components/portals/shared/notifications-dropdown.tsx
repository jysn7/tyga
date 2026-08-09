"use client"

import Link from "next/link"
import { Bell, Check, ChevronRight, Inbox } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read?: boolean
  link?: string
}

interface NotificationsDropdownProps {
  notifications?: NotificationItem[]
  unreadCount?: number
  onMarkAllAsRead?: () => void
}

export function NotificationsDropdown({
  notifications = [],
  unreadCount = 0,
  onMarkAllAsRead,
}: NotificationsDropdownProps) {
  const displayNotifications = notifications.slice(0, 4)
  const hasUnread = unreadCount > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title="Notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 py-2">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </span>
          {hasUnread && onMarkAllAsRead && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {displayNotifications.length > 0 ? (
          <DropdownMenuGroup className="flex flex-col divide-y divide-border/60">
            {displayNotifications.map((item) => {
              const content = (
                <div className="flex w-full items-center gap-2.5 px-3 py-2.5">
                  {!item.read && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="truncate text-sm text-foreground">
                        {item.title}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        — {item.description}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {item.time}
                  </span>
                </div>
              )

              return (
                <DropdownMenuItem
                  key={item.id}
                  className="cursor-pointer rounded-none p-0"
                >
                  {item.link ? (
                    <Link href={item.link} className="w-full">
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
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
