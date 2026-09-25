"use client"

import { PanelLeftOpen, CircleHelp } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { UserDropdown } from "@/components/portals/shared/user-dropdown"
import { NotificationsDropdown } from "@/components/portals/shared/notifications-dropdown"
import { HelpModal } from "@/components/portals/shared/help-modal"
import { GlobalSearch } from "@/components/portals/shared/global-search"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

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

type Account = {
  id: string
  role: "parent" | "coach" | "admin"
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  active: boolean
  created_at: string
}

export function LayoutHeader({ user }: { user: SupabaseUser | null }) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [helpOpen, setHelpOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true)

        if (!user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .rpc("get_my_account")
          .single<Account>()

        if (error) {
          console.error("Error fetching account:", error)
          setLoading(false)
          return
        }

        if (data) {
          setAccount(data)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [user, supabase])

  return (
    <>
      <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center gap-3 rounded-t-xl border-b border-border/50 bg-background px-4 sm:px-6">
        {/* Left: toggle + search */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Open sidebar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}

          {loading ? (
            <div className="h-9 w-full max-w-md animate-pulse rounded-md bg-muted/40" />
          ) : account?.role ? (
            <GlobalSearch role={account.role} />
          ) : (
            <div className="h-9 w-full max-w-md" />
          )}
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            title="Help"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <CircleHelp className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <NotificationsDropdown
            notifications={sampleNotifications}
            unreadCount={2}
          />
          <UserDropdown user={user} account={account} loading={loading} />
        </div>
      </header>

      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  )
}
