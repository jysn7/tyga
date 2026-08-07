// lib/useAuth.ts
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuth(options?: {
  redirectTo?: string
  redirectIfAuthenticated?: boolean
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const { redirectTo = "/auth/signin", redirectIfAuthenticated = false } =
    options || {}

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) throw error

        const currentUser = session?.user || null
        setUser(currentUser)

        if (redirectIfAuthenticated && currentUser) {
          router.replace("/dashboard")
          return
        }

        if (!redirectIfAuthenticated && !currentUser) {
          router.replace(redirectTo)
          return
        }

        setAuthorized(true)
      } catch (error) {
        console.error("Auth check error:", error)
        if (!redirectIfAuthenticated) {
          router.replace(redirectTo)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)

      if (!redirectIfAuthenticated && !currentUser) {
        router.replace(redirectTo)
      }

      if (redirectIfAuthenticated && currentUser) {
        router.replace("/dashboard")
      }

      setAuthorized(!!currentUser || redirectIfAuthenticated)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, redirectTo, redirectIfAuthenticated, supabase])

  return { user, loading, authorized }
}
