"use client"

import { createContext, useContext, useEffect, useState } from "react"

type FullscreenContextValue = {
  fullscreen: boolean
  setFullscreen: (v: boolean) => void
}

const FullscreenContext = createContext<FullscreenContextValue | null>(null)

export function FullscreenProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [fullscreen, setFullscreen] = useState(false)
  return (
    <FullscreenContext.Provider value={{ fullscreen, setFullscreen }}>
      {children}
    </FullscreenContext.Provider>
  )
}

/**
 * Call from any page to request a fullscreen layout (no mobile nav, no footer).
 * Automatically restores the normal layout on unmount.
 *
 * Usage:
 *   useFullscreen()          // enable while this page is mounted
 *   useFullscreen(true)      // same
 *   useFullscreen(false)     // explicit off
 *   useFullscreen(condition) // conditional
 */
export function useFullscreen(enable: boolean = true) {
  const ctx = useContext(FullscreenContext)

  useEffect(() => {
    if (!ctx) {
      // Provider isn't mounted — silently ignore so pages that don't use
      // AppShell (e.g. auth pages) don't crash.
      return
    }
    ctx.setFullscreen(enable)
    return () => {
      ctx.setFullscreen(false)
    }
  }, [enable, ctx])
}

export function useFullscreenState() {
  const ctx = useContext(FullscreenContext)
  if (!ctx) {
    throw new Error(
      "useFullscreenState must be used inside a FullscreenProvider"
    )
  }
  return ctx
}
