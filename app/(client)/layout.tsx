"use client"

import { AppShell } from "@/components/portals/shared/app-shell"
import { useAuth } from "@/hooks/useAuth"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, authorized } = useAuth({ requiredRole: "parent" })

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <AppShell portal="client" user={user}>
      {children}
    </AppShell>
  )
}
