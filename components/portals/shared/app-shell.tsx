"use client"

import { Sidebar } from "./sidebar"
import { LayoutHeader } from "./layout-header"
import { clientNav } from "@/config/nav-client"
import { coachNav } from "@/config/nav-coach"
import { adminNav } from "@/config/nav-admin"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const navMap = {
  client: clientNav,
  coach: coachNav,
  admin: adminNav,
}

export function AppShell({
  portal,
  children,
}: {
  portal: "client" | "coach" | "admin"
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading, authorized } = useAuth()
  const nav = navMap[portal]

  useEffect(() => {
    // If user is loaded and their role doesn't match the portal,
    // redirect them to the correct portal
    if (user && !loading) {
      const userRole = user.user_metadata?.role || "client"

      // If the user's role doesn't match the current portal
      if (userRole !== portal) {
        router.replace(`/${userRole}`)
      }
    }
  }, [user, loading, portal, router])

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authorized, don't render
  if (!authorized) {
    return null
  }

  // Pass user data to LayoutHeader and Sidebar
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={nav} user={user} />
      <div className="flex flex-1 flex-col overflow-hidden p-2 shadow">
        <LayoutHeader user={user} />
        <main className="flex-1 overflow-y-auto bg-background p-6 pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}
