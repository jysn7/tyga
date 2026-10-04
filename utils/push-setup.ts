import { createClient } from "@/utils/supabase/client"

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY

export async function registerPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported.")
    return
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY!),
    })

    const subJSON = subscription.toJSON()
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && subJSON.endpoint && subJSON.keys) {
      await supabase.from("push_subscriptions").upsert(
        {
          account_id: user.id, // Links to Jayson's existing accounts structure
          endpoint: subJSON.endpoint,
          p256dh: subJSON.keys.p256dh,
          auth: subJSON.keys.auth,
        },
        { onConflict: "endpoint" }
      )

      console.log("Push Notifications registered!")
    }
  } catch (error) {
    console.error("Error registering push notifications:", error)
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
