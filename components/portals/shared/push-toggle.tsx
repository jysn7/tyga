"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import {
  isSubscribed,
  pushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/functions/push/subscribe"

export function PushToggle() {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const ok = pushSupported()
        if (cancelled) return
        setSupported(ok)
        if (ok) {
          const subscribed = await isSubscribed()
          if (!cancelled) setEnabled(subscribed)
        }
      } catch (err) {
        console.error("[PushToggle] check failed:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  if (!supported) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-foreground">Push notifications</span>
          <span className="text-xs text-muted-foreground">
            Not supported in this browser
          </span>
        </div>
      </div>
    )
  }

  async function handleToggle(next: boolean) {
    setLoading(true)
    try {
      if (next) {
        const result = await subscribeToPush()
        if (result.ok) {
          setEnabled(true)
          toast.add({
            title: "Push notifications enabled",
            description: "You'll get updates on this device.",
            type: "success",
            timeout: 4000,
          })
        } else {
          toast.add({
            title: "Couldn't enable notifications",
            description: result.reason,
            type: "error",
            timeout: 5000,
          })
        }
      } else {
        await unsubscribeFromPush()
        setEnabled(false)
        toast.add({
          title: "Push notifications disabled",
          type: "success",
          timeout: 4000,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          Push notifications
        </span>
        <span className="text-xs text-muted-foreground">
          Get system notifications on this device when something happens
        </span>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  )
}
