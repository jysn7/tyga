"use client"

import { useEffect, useRef } from "react"

export type ShortcutHandler = (event: KeyboardEvent) => void

export type ShortcutDefinition = {
  /** Primary key(s). For sequences, pass an array like ["g", "d"]. */
  keys: string[]
  handler: ShortcutHandler
  /** Fire even when the user is typing in an input. Default false. */
  allowInInput?: boolean
  /** Require Cmd (Mac) or Ctrl (Win/Linux) to be held. Default false. */
  withMod?: boolean
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]) {
  const pending = useRef<string | null>(null)
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function resetPending() {
      pending.current = null
      if (pendingTimer.current) {
        clearTimeout(pendingTimer.current)
        pendingTimer.current = null
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase()
      const editable = isEditable(e.target)
      const hasMod = e.metaKey || e.ctrlKey

      // --- Phase 1: complete a pending two-key sequence ---
      if (pending.current) {
        const candidate = shortcuts.find(
          (s) =>
            s.keys.length === 2 &&
            s.keys[0] === pending.current &&
            s.keys[1] === key
        )
        if (candidate) {
          if (!candidate.allowInInput && editable) {
            resetPending()
            return
          }
          if (!!candidate.withMod !== hasMod) {
            resetPending()
            return
          }
          e.preventDefault()
          candidate.handler(e)
          resetPending()
          return
        }
        resetPending()
      }

      // --- Phase 2: single-key match ---
      const single = shortcuts.find(
        (s) =>
          s.keys.length === 1 && s.keys[0] === key && !!s.withMod === hasMod
      )
      if (single) {
        if (!single.allowInInput && editable) return
        e.preventDefault()
        single.handler(e)
        return
      }

      // --- Phase 3: start a new sequence ---
      const startsSequence = shortcuts.some(
        (s) => s.keys.length === 2 && s.keys[0] === key
      )
      if (startsSequence && !editable && !hasMod) {
        pending.current = key
        if (pendingTimer.current) clearTimeout(pendingTimer.current)
        pendingTimer.current = setTimeout(resetPending, 1500)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      resetPending()
    }
  }, [shortcuts])
}
