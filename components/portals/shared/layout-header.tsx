"use client"

import { PanelLeftOpen } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { UserDropdown } from "@/components/portals/shared/user-dropdown"
import { NotificationsDropdown } from "@/components/portals/shared/notifications-dropdown"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const sampleNotifications = [
  {
    id: "1",
    title: "New Registration",
    description: "A new golfer completed their enrollment profile.",
    time: "2m ago",
    read: false,
    link: "/golfers/123",
  },
  {
    id: "2",
    title: "Payment Received",
    description: "Invoice #1042 has been settled successfully.",
    time: "1h ago",
    read: false,
    link: "/billing",
  },
  {
    id: "3",
    title: "System Update",
    description: "Platform maintenance scheduled for Sunday at 02:00 UTC.",
    time: "3h ago",
    read: true,
  },
  {
    id: "4",
    title: "Integration Active",
    description: "Stripe webhooks are operating smoothly.",
    time: "1d ago",
    read: true,
    link: "/integrations",
  },
]

export function LayoutHeader({ user }: { user: SupabaseUser | null }) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <header className="sticky top-0 z-20 flex h-18 shrink-0 items-center justify-between rounded-t-xl bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        {!sidebarOpen && (
          <button
            type="button"
            onClick={toggleSidebar}
            title="Open sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <NotificationsDropdown
          notifications={sampleNotifications}
          unreadCount={2}
        />
        <UserDropdown user={user} />
      </div>
    </header>
  )
}
