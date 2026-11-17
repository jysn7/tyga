"use client"

import { CircleHelp, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { createClient } from "@/utils/supabase/client"
import { useRealtimeNotifications } from "@/hooks/use-notifications"
import { useUnreadMessages } from "@/hooks/shared/use-support"

import { UserDropdown } from "@/components/portals/shared/user-dropdown"
import { NotificationsDropdown } from "@/components/portals/shared/notifications-dropdown"
import { HelpModal } from "@/components/portals/shared/help-modal"
import { GlobalSearch } from "@/components/portals/shared/global-search"

import { ParentOnboardingOverlay } from "./parent-onboarding-overlay"
import { CoachOnboardingOverlay } from "./coach-onboarding-overlay"

type Account = {
  id: string
  role: "parent" | "coach" | "admin"
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  active: boolean
  onboarding_seen: boolean
  created_at: string
}

export function LayoutHeader({ user }: { user: SupabaseUser | null }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [helpOpen, setHelpOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const pathname = usePathname()
  const { data: unread = 0 } = useUnreadMessages()

  // Realtime — opens one channel for this account's notifications.
  useRealtimeNotifications(account?.id ?? null)

  useEffect(() => {
    const supabase = createClient()

    const fetchAccount = async () => {
      try {
        setLoading(true)

        if (!user) {
          return
        }

        const { data, error } = await supabase
          .rpc("get_my_account")
          .single<Account>()

        if (error) {
          console.error("Error fetching account:", error)
          return
        }

        if (data) {
          setAccount(data)

          const eligibleForOnboarding =
            data.role === "parent" || data.role === "coach"

          if (eligibleForOnboarding && !data.onboarding_seen) {
            setShowOnboarding(true)
          }
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [user])

  async function handleOnboardingClose() {
    if (!account) {
      setShowOnboarding(false)
      return
    }

    const supabase = createClient()

    const { error } = await supabase
      .from("accounts")
      .update({
        onboarding_seen: true,
      })
      .eq("id", account.id)

    if (error) {
      console.error("Failed to update onboarding_seen:", error)
    }

    setAccount((prev) =>
      prev
        ? {
            ...prev,
            onboarding_seen: true,
          }
        : prev
    )

    setShowOnboarding(false)
  }

  const onboardingRole =
    account?.role === "parent" || account?.role === "coach"
      ? account.role
      : null

  // Messages page lives under /{role}/messages for coach/admin, /messages for parents
  const messagesHref =
    account?.role === "admin"
      ? "/admin/messages"
      : account?.role === "coach"
        ? "/coach/messages"
        : "/messages"

  const messagesActive = pathname?.startsWith(messagesHref)

  return (
    <>
      <header className="sticky top-0 z-20 flex shrink-0 flex-col gap-3 rounded-t-xl border-b border-border/50 bg-background px-4 py-3 sm:h-20 sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-0">
        <div className="flex w-full items-center gap-3">
          <div className="hidden min-w-0 flex-1 sm:block">
            {loading ? (
              <div className="h-9 w-full max-w-md animate-pulse rounded-md bg-muted/40" />
            ) : account?.role ? (
              <GlobalSearch role={account.role} />
            ) : (
              <div className="h-9 w-full max-w-md" />
            )}
          </div>

          <div className="flex-1 sm:hidden" />

          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href={messagesHref}
              title="Messages"
              aria-label={
                unread > 0 ? `Messages, ${unread} unread` : "Messages"
              }
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent hover:text-foreground ${
                messagesActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              {unread > 0 && (
                <span
                  aria-hidden
                  className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] leading-none font-semibold text-white"
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              title="Help"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <CircleHelp className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <NotificationsDropdown />

            <UserDropdown user={user} account={account} loading={loading} />
          </div>
        </div>

        <div className="w-full sm:hidden">
          {loading ? (
            <div className="h-9 w-full animate-pulse rounded-md bg-muted/40" />
          ) : account?.role ? (
            <GlobalSearch role={account.role} />
          ) : (
            <div className="h-9 w-full" />
          )}
        </div>
      </header>

      {onboardingRole === "parent" && (
        <ParentOnboardingOverlay
          open={showOnboarding}
          onClose={handleOnboardingClose}
        />
      )}

      {onboardingRole === "coach" && (
        <CoachOnboardingOverlay
          open={showOnboarding}
          onClose={handleOnboardingClose}
        />
      )}

      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  )
}
