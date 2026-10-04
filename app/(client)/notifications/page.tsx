"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { NotificationList } from "@/components/portals/client/notifications/notifications-list"
import { useNotifications, useMarkAllRead } from "@/hooks/use-notifications"

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const {
    data: notifications = [],
    isLoading,
    isFetching,
  } = useNotifications(limit, 0)
  const markAllRead = useMarkAllRead()

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const hasMore = notifications.length === limit

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Notifications"
        meta={
          unreadCount > 0 ? (
            <span>{unreadCount} unread</span>
          ) : (
            <span>You are all caught up</span>
          )
        }
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-input px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
            >
              {markAllRead.isPending ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin"
                  strokeWidth={1.75}
                />
              ) : (
                <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              Mark all read
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <>
          <NotificationList notifications={notifications} />

          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                disabled={isFetching}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-input px-4 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
              >
                {isFetching ? (
                  <>
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      strokeWidth={1.75}
                    />
                    Loading…
                  </>
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
