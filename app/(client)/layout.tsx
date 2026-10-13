"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/portals/shared/app-shell"
import { useAuth } from "@/hooks/useAuth"
import { useMfaPolicy } from "@/hooks/shared/use-mfa-policy"
import ClientLayoutSkeleton from "@/components/portals/shared/client-layout-skeleton"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, authorized } = useAuth({ requiredRole: "parent" })
  const { mfaStatus, mfaLoading } = useMfaPolicy()
  const router = useRouter()

  useEffect(() => {
    if (loading || mfaLoading) return

    // Only challenge if the parent has already enrolled in MFA.
    // Do NOT force enrollment — MFA is optional for parents.
    if (mfaStatus === "needs-challenge") {
      router.replace(
        `/auth/mfa/challenge?next=${encodeURIComponent(window.location.pathname)}`
      )
    }
  }, [mfaStatus, mfaLoading, loading, router])

  if (loading || mfaLoading) {
    return (
      <div className="animate-in duration-300 fade-in">
        <ClientLayoutSkeleton />
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  // If the parent has MFA enrolled but hasn't verified, hold the render
  // while the redirect effect runs. Parents without MFA fall through.
  if (mfaStatus === "needs-challenge") {
    return (
      <div className="animate-in duration-300 fade-in">
        <ClientLayoutSkeleton />
      </div>
    )
  }

  return (
    <AppShell portal="client" user={user}>
      {children}
    </AppShell>
  )
}
