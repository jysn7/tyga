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
        if (!redirectIfAuthenticated) {
          router.replace(redirectTo)
        }
        return
      }

      if (redirectIfAuthenticated) {
        setUser(session.user)
        setLoading(false)
        setAuthorized(true)
        router.replace("/dashboard")
        return
      }

      const { data: account, error } = await supabase
        .rpc("get_my_account")
        .single<{ role: Role }>()

      if (error || !account) {
        setUser(session.user)
        setRole(null)
        setLoading(false)
        setAuthorized(false)
        router.replace(redirectTo)
        return
      }

      if (requiredRole && account.role !== requiredRole) {
        setUser(session.user)
        setRole(account.role)
        setLoading(false)
        setAuthorized(false)
        // Send them to their actual portal instead of a dead end
        const portalPath =
          account.role === "admin"
            ? "/admin/overview"
            : account.role === "coach"
              ? "/coach"
              : "/dashboard"
        router.replace(portalPath)
        return
      }

      setUser(session.user)
      setRole(account.role)
      setLoading(false)
      setAuthorized(true)
    }

    check()
  }, [redirectTo, redirectIfAuthenticated, requiredRole, router])

  return { user, role, loading, authorized }
}
