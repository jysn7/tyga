"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"

type Role = "parent" | "coach" | "admin"

type UseAuthOptions = {
  redirectTo?: string
  redirectIfAuthenticated?: boolean
  requiredRole?: Role
}

const PORTAL_HOME: Record<Role, string> = {
  parent: "/dashboard",
  coach: "/coach/overview",
  admin: "/admin/overview",
}

function portalPathFor(role: Role | null | undefined): string {
  return role ? PORTAL_HOME[role] : "/dashboard"
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    redirectTo = "/auth/signin",
    redirectIfAuthenticated = false,
    requiredRole,
  } = options

  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function fetchRole(): Promise<Role | null> {
      // Use the security definer RPC — bypasses RLS on accounts
      const { data, error } = await supabase
        .rpc("get_my_account")
        .single<{ role: Role }>()

      if (error) {
        console.error("[useAuth] get_my_account failed:", error.message)
        return null
      }
      return data?.role ?? null
    }

    async function handleSession(session: { user: User } | null) {
      if (cancelled) return

      if (!session) {
        setUser(null)
        setRole(null)
        setLoading(false)
        setAuthorized(false)
        if (!redirectIfAuthenticated) router.replace(redirectTo)
        return
      }

      const userRole = await fetchRole()
      if (cancelled) return

      // Signed-in user on an auth page → send to their portal
      if (redirectIfAuthenticated) {
        setUser(session.user)
        setRole(userRole)
        setLoading(false)
        setAuthorized(false)
        router.replace(portalPathFor(userRole))
        return
      }

      // Required role mismatch → send to their own portal
      if (requiredRole && userRole !== requiredRole) {
        setUser(session.user)
        setRole(userRole)
        setLoading(false)
        setAuthorized(false)
        router.replace(portalPathFor(userRole))
        return
      }

      setUser(session.user)
      setRole(userRole)
      setLoading(false)
      setAuthorized(true)
    }

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      await handleSession(session)
    }

    check()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") return
      await handleSession(session)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [redirectTo, redirectIfAuthenticated, requiredRole, router])

  return { user, role, loading, authorized }
}
