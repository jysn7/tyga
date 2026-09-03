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

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setUser(null)
        setRole(null)
        setLoading(false)
        setAuthorized(false)
        if (!redirectIfAuthenticated) {
          router.replace(redirectTo)
        }
        return
      }

      // If this is an auth page (signin/signup), redirect to dashboard
      if (redirectIfAuthenticated) {
        setUser(session.user)
        setLoading(false)
        setAuthorized(true)
        router.replace("/dashboard")
        return
      }

      // Get the user's role from accounts table
      const { data: account, error } = await supabase
        .from("accounts")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (error || !account) {
        // User exists in auth but not in accounts - this shouldn't happen
        setUser(session.user)
        setRole(null)
        setLoading(false)
        setAuthorized(false)
        router.replace(redirectTo)
        return
      }

      const userRole = account.role as Role

      // Check if the user has the required role
      if (requiredRole && userRole !== requiredRole) {
        setUser(session.user)
        setRole(userRole)
        setLoading(false)
        setAuthorized(false)
        // Redirect to their actual portal
        const portalPath =
          userRole === "admin"
            ? "/admin/overview"
            : userRole === "coach"
              ? "/coach"
              : "/dashboard"
        router.replace(portalPath)
        return
      }

      setUser(session.user)
      setRole(userRole)
      setLoading(false)
      setAuthorized(true)
    }

    check()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        setUser(null)
        setRole(null)
        setLoading(false)
        setAuthorized(false)
        if (!redirectIfAuthenticated) {
          router.replace(redirectTo)
        }
        return
      }

      // Re-check role on auth change
      const { data: account } = await supabase
        .from("accounts")
        .select("role")
        .eq("id", session.user.id)
        .single()

      const userRole = account?.role as Role | null

      if (requiredRole && userRole !== requiredRole) {
        setUser(session.user)
        setRole(userRole)
        setLoading(false)
        setAuthorized(false)
        const portalPath =
          userRole === "admin"
            ? "/admin/overview"
            : userRole === "coach"
              ? "/coach"
              : "/dashboard"
        router.replace(portalPath)
        return
      }

      setUser(session.user)
      setRole(userRole)
      setLoading(false)
      setAuthorized(true)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [redirectTo, redirectIfAuthenticated, requiredRole, router])

  return { user, role, loading, authorized }
}
