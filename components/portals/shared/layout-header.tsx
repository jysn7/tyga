"use client"

import { Bell, PanelLeftOpen, User } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function LayoutHeader() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <header className="sticky top-0 z-20 flex h-18 shrink-0 items-center justify-between rounded-t-xl bg-secondary px-4 sm:px-6">
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
        <button
          type="button"
          title="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>

        <button
          type="button"
          title="Account"
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-accent"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-muted text-muted-foreground">
              <User className="h-4.5 w-4.5" />
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  )
}
