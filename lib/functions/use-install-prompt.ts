"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent
  }
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(() =>
      typeof window !== "undefined"
        ? (window.__deferredInstallPrompt ?? null)
        : null
    )
  const [isInstalled, setIsInstalled] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true)
  )
  const [isIOS] = useState(
    () =>
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & typeof globalThis & { MSStream?: unknown }).MSStream
  )

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      window.__deferredInstallPrompt = evt
      setInstallPrompt(evt)
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setInstallPrompt(null)
      window.__deferredInstallPrompt = undefined
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  async function promptInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === "accepted") {
      setIsInstalled(true)
    }
    setInstallPrompt(null)
    window.__deferredInstallPrompt = undefined
  }

  // Covers every real case:
  // - canPromptInstall: Chrome/Edge/Android — the real native prompt is available
  // - isIOS: Safari never fires beforeinstallprompt — show manual instructions instead
  // - neither, not installed: Firefox or a Chrome session that hasn't met engagement
  //   heuristics yet — nothing to show, let them skip rather than get stuck
  return {
    isInstalled,
    isIOS,
    canPromptInstall: Boolean(installPrompt),
    promptInstall,
  }
}
