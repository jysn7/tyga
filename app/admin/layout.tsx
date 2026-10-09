"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/portals/shared/app-shell"
import { useAuth } from "@/hooks/useAuth"
import { useMfaPolicy } from "@/hooks/shared/use-mfa-policy"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, authorized } = useAuth({ requiredRole: "admin" })
  const { mfaStatus, mfaLoading } = useMfaPolicy()
  const router = useRouter()

  useEffect(() => {
    if (mfaLoading || loading) return

    if (mfaStatus === "needs-enrollment") {
      router.replace("/auth/mfa/enroll")
      return
    }

    if (mfaStatus === "needs-challenge") {
      router.replace(
        `/auth/mfa/challenge?next=${encodeURIComponent(window.location.pathname)}`
      )
    }
  }, [mfaStatus, mfaLoading, loading, router])

  if (loading || mfaLoading) {
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

  // Block render while MFA is unresolved or pending redirect
  if (mfaStatus !== "verified") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Redirecting to two-factor authentication...
          </p>
        </div>
      </div>
    )
  }

  return (
    <AppShell portal="admin" user={user}>
      {children}
    </AppShell>
  )
}
