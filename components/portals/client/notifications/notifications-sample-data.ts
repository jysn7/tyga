import type { NotificationItem } from "@/components/portals/client/notifications/notifications-list"

export const sampleNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Session reminder",
    body: "Jayden's Skill Building session is tomorrow at 4:00 PM, Zodwa Khoza Foundation.",
    relatedType: "session",
    createdAt: "2026-08-01T09:00:00Z",
    readAt: null,
  },
  {
    id: "2",
    title: "Payment received",
    body: "Your payment of R650 for Holiday Camp — July has been confirmed.",
    relatedType: "payment",
    createdAt: "2026-07-27T14:32:00Z",
    readAt: "2026-07-27T15:00:00Z",
  },
  {
    id: "3",
    title: "Level upgrade",
    body: "Jayden has progressed to Skill Building. Nice work!",
    relatedType: "level_progression",
    createdAt: "2026-07-20T11:15:00Z",
    readAt: "2026-07-20T18:00:00Z",
  },
  {
    id: "4",
    title: "Invoice overdue",
    body: "Your invoice for Foundation — Tuesday & Thursday (Lerato) is now overdue.",
    relatedType: "payment",
    createdAt: "2026-06-23T08:00:00Z",
    readAt: null,
  },
]
