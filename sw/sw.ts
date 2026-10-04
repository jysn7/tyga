import { defaultCache } from "@serwist/turbopack/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

// ---------------------------------------------------------------------------
// Push notifications
// ---------------------------------------------------------------------------

type PushPayload = {
  title?: string
  body?: string
  url?: string
  icon?: string
  badge?: string
  tag?: string
}

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return

  let payload: PushPayload
  try {
    payload = event.data.json() as PushPayload
  } catch {
    payload = { title: "TYGA", body: event.data.text() }
  }

  const title = payload.title ?? "TYGA"
  const options: NotificationOptions = {
    body: payload.body ?? "",
    icon: payload.icon ?? "/icons/icon-192.png",
    badge: payload.badge ?? "/icons/icon-192.png",
    tag: payload.tag,
    data: { url: payload.url ?? "/dashboard" },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close()

  const targetUrl = (event.notification.data?.url as string) ?? "/dashboard"

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          // Focus an existing tab if it's already on the target URL
          if (client.url.endsWith(targetUrl) && "focus" in client) {
            return client.focus()
          }
        }
        // Otherwise open a new tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})

serwist.addEventListeners()
