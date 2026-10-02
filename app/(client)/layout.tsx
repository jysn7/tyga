"use client"

import { AppShell } from "@/components/portals/shared/app-shell"
import { useAuth } from "@/hooks/useAuth"
import ClientLayoutSkeleton from "@/components/portals/shared/client-layout-skeleton"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, authorized } = useAuth({ requiredRole: "parent" })

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
    <AppShell portal="client" user={user}>
      {children}
    </AppShell>
  )
}
