import { PageHeader } from "@/components/portals/shared/page-header"
import { NotificationList } from "@/components/portals/client/notifications/notifications-list"
import { sampleNotifications } from "@/components/portals/client/notifications/notifications-sample-data"

export default function NotificationsPage() {
  const unreadCount = sampleNotifications.filter((n) => !n.readAt).length

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
      />
      <NotificationList notifications={sampleNotifications} />
    </div>
  )
}
