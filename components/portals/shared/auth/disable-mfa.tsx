// components/auth/disable-mfa.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

type Props = {
  factorId: string
}

export function DisableMFA({ factorId }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDisable = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.mfa.unenroll({ factorId })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.refresh()
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="self-start rounded-lg border border-(--d-border) px-4 py-2 text-xs font-medium text-(--d-foreground) transition-colors hover:border-red-500/40 hover:text-red-500"
      >
        Disable two-factor authentication
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
      <p className="text-xs leading-relaxed text-(--d-foreground)">
        Disabling two-factor authentication will make your account less secure.
        Are you sure?
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleDisable}
          disabled={loading}
          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "Disabling..." : "Yes, disable"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-lg border border-(--d-border) px-3 py-1.5 text-xs font-medium text-(--d-foreground) disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
