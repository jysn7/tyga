import type { Notification } from "@/hooks/use-notifications"

export const sampleNotifications: Notification[] = [
  {
    id: 1,
    type: "session_reminder",
    title: "Session reminder",
    body: "Jayden's Skill Building session is tomorrow at 4:00 PM, Zodwa Khoza Foundation.",
    relatedType: "session",
    relatedId: 42,
    isRead: false,
    createdAt: "2026-08-01T09:00:00Z",
  },
  {
    id: 2,
    type: "payment_confirmed",
    title: "Payment received",
    body: "Your payment of R650 for Holiday Camp — July has been confirmed.",
    relatedType: "payment",
    relatedId: 7,
    isRead: true,
    createdAt: "2026-07-27T14:32:00Z",
  },
  {
    id: 3,
    type: "level_upgrade",
    title: "Level upgrade",
    body: "Jayden has progressed to Skill Building. Nice work!",
    relatedType: "level_progression",
    relatedId: 9,
    isRead: true,
    createdAt: "2026-07-20T11:15:00Z",
  },
  {
    id: 4,
    type: "payment",
    title: "Invoice overdue",
    body: "Your invoice for Foundation — Tuesday & Thursday (Lerato) is now overdue.",
    relatedType: "payment",
    relatedId: 11,
    isRead: false,
    createdAt: "2026-06-23T08:00:00Z",
  },
]
