"use client"

import { AppShell } from "@/components/portals/shared/app-shell"
import ClientLayoutSkeleton from "@/components/portals/shared/client-layout-skeleton"
import { useAuth } from "@/hooks/useAuth"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, authorized } = useAuth({ requiredRole: "coach" })

  if (loading) {
    return (
      <div className="animate-in duration-300 fade-in">
        <ClientLayoutSkeleton />
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <AppShell portal="coach" user={user}>
      {children}
    </AppShell>
  )
}
