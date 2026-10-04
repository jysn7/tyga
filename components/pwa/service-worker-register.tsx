"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    navigator.serviceWorker
      .register("/serwist/sw.js", { scope: "/" })
      .then((reg) => console.log("[SW] registered, scope:", reg.scope))
      .catch((err) => console.error("[SW] registration failed:", err))
  }, [])

  return null
}
