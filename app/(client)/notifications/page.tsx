import { Bell } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { NotificationList } from "@/components/portals/client/notifications/notifications-list"
import { sampleNotifications } from "@/components/portals/client/notifications/notifications-sample-data"

export default function NotificationsPage() {
  const unreadCount = sampleNotifications.filter((n) => !n.readAt).length

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        icon={Bell}
        title="Notifications"
        meta={
          unreadCount > 0 ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {unreadCount} unread
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              You are all caught up
            </span>
          )
        }
      />
      <NotificationList notifications={sampleNotifications} />
    </div>
  )
}
