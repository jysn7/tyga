"use client"

import { AppShell } from "@/components/portals/shared/app-shell"
import { useAuth } from "@/hooks/useAuth"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, authorized } = useAuth()

  // Show loading state while checking auth
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

  // If not authorized, don't render (will redirect)
  if (!authorized) {
    return null
  }

  return <AppShell portal="client">{children}</AppShell>
}
