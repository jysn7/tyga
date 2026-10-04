// lib/push/subscribe.ts
"use client"

import { createClient } from "@/utils/supabase/client"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const READY_TIMEOUT_MS = 3000

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

/**
 * Resolves with the active registration, or null if none becomes ready
 * in time. Stops `serviceWorker.ready` from hanging forever when no
 * worker controls the page's scope.
 */
async function getReadyRegistration(
  timeoutMs = READY_TIMEOUT_MS
): Promise<ServiceWorkerRegistration | null> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ])
}

export async function isSubscribed(): Promise<boolean> {
  if (!pushSupported()) return false
  const reg = await getReadyRegistration()
  if (!reg) return false
  const sub = await reg.pushManager.getSubscription()
  return sub !== null
}

export async function subscribeToPush(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  if (!pushSupported()) {
    return { ok: false, reason: "Push not supported in this browser" }
  }

  if (!VAPID_PUBLIC_KEY) {
    return { ok: false, reason: "Push isn't configured (missing VAPID key)" }
  }

  try {
    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission

    if (permission !== "granted") {
      return {
        ok: false,
        reason:
          permission === "denied"
            ? "Notifications are blocked. Enable them in your browser settings."
            : "Permission denied",
      }
    }

    const reg = await getReadyRegistration()
    if (!reg) {
      return {
        ok: false,
        reason:
          "Service worker isn't ready yet. Reload the page and try again.",
      }
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { ok: false, reason: "Not signed in" }

    const existing = await reg.pushManager.getSubscription()
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          VAPID_PUBLIC_KEY
        ) as BufferSource,
      }))

    const raw = sub.toJSON() as {
      endpoint: string
      keys: { p256dh: string; auth: string }
    }

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        account_id: user.id,
        endpoint: raw.endpoint,
        p256dh: raw.keys.p256dh,
        auth: raw.keys.auth,
      },
      { onConflict: "endpoint" }
    )

    if (error) {
      // Roll back a brand-new browser subscription so the browser and
      // database don't disagree
      if (!existing) await sub.unsubscribe()
      return { ok: false, reason: error.message }
    }

    return { ok: true }
  } catch (err) {
    console.error("[push] subscribe failed:", err)
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Something went wrong",
    }
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!pushSupported()) return

  try {
    const reg = await getReadyRegistration()
    const sub = await reg?.pushManager.getSubscription()
    if (!sub) return

    const endpoint = sub.endpoint
    const supabase = createClient()
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)

    if (error) console.error("[push] db delete failed:", error.message)

    await sub.unsubscribe()
  } catch (err) {
    console.error("[push] unsubscribe failed:", err)
  }
}
