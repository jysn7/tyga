"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  useKeyboardShortcuts,
  type ShortcutDefinition,
} from "@/hooks/shared/use-keyboard-shortcuts"
import { useAppStore } from "@/stores/useAppStore"

export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const account = useAppStore((s) => s.account)
  const setShortcutsOpen = useAppStore((s) => s.setShortcutsOpen)
  const role = account?.role ?? null

  const shortcuts = useMemo<ShortcutDefinition[]>(() => {
    if (!role) return []

    const nav: ShortcutDefinition[] = [
      {
        keys: ["g", "d"],
        handler: () =>
          router.push(
            role === "admin"
              ? "/admin/overview"
              : role === "coach"
                ? "/coach/dashboard"
                : "/dashboard"
          ),
      },
      { keys: ["g", "p"], handler: () => router.push("/programmes") },
      {
        keys: ["g", "n"],
        handler: () =>
          router.push(
            role === "admin"
              ? "/admin/notifications"
              : role === "coach"
                ? "/coach/notifications"
                : "/notifications"
          ),
      },
      {
        keys: ["g", "s"],
        handler: () =>
          router.push(
            role === "admin"
              ? "/admin/system"
              : role === "coach"
                ? "/coach/settings"
                : "/settings"
          ),
      },
      { keys: ["g", "h"], handler: () => router.push("/help") },
      {
        keys: ["?"],
        handler: () => setShortcutsOpen(true),
        allowInInput: true,
      },
    ]

    const parent: ShortcutDefinition[] =
      role === "parent"
        ? [
            { keys: ["g", "m"], handler: () => router.push("/members") },
            { keys: ["g", "b"], handler: () => router.push("/billing") },
            {
              keys: ["g", "w"],
              handler: () => router.push("/dashboard/waitlist"),
            },
          ]
        : []

    const coach: ShortcutDefinition[] =
      role === "coach"
        ? [
            {
              keys: ["g", "c"],
              handler: () => router.push("/coach/dashboard"),
            },
            {
              keys: ["g", "m"],
              handler: () => router.push("/coach/my-students"),
            },
            {
              keys: ["g", "a"],
              handler: () => router.push("/coach/appointments"),
            },
          ]
        : []

    const admin: ShortcutDefinition[] =
      role === "admin"
        ? [
            { keys: ["g", "a"], handler: () => router.push("/admin/accounts") },
            { keys: ["g", "m"], handler: () => router.push("/admin/members") },
            {
              keys: ["g", "e"],
              handler: () => router.push("/admin/enrollments"),
            },
            { keys: ["g", "f"], handler: () => router.push("/admin/finance") },
            { keys: ["g", "t"], handler: () => router.push("/admin/tickets") },
            { keys: ["g", "x"], handler: () => router.push("/admin/system") },
          ]
        : []

    return [...nav, ...parent, ...coach, ...admin]
  }, [role, router, setShortcutsOpen])

  useKeyboardShortcuts(shortcuts)

  return <>{children}</>
}
