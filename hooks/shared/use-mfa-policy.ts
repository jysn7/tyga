"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

type MfaStatus = "loading" | "verified" | "needs-challenge" | "needs-enrollment"

const supabase = createClient()

export function useMfaPolicy() {
  const [mfaStatus, setMfaStatus] = useState<MfaStatus>("loading")
  const [mfaLoading, setMfaLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function check() {
      const { data: aal } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (cancelled) return

      const current = aal?.currentLevel
      const next = aal?.nextLevel

      if (current === "aal2") {
        setMfaStatus("verified")
      } else if (current === "aal1" && next === "aal2") {
        setMfaStatus("needs-challenge")
      } else {
        setMfaStatus("needs-enrollment")
      }

      setMfaLoading(false)
    }

    check()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check()
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  return { mfaStatus, mfaLoading }
}
