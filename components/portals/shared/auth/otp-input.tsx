"use client"

import { useEffect, useRef, useState } from "react"

const LENGTH = 6

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  invalid = false,
  label = "6-digit code",
}: {
  value: string
  onChange: (code: string) => void
  onComplete?: (code: string) => void // optional: fires when all six digits are filled
  disabled?: boolean
  autoFocus?: boolean
  invalid?: boolean
  label?: string
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: LENGTH }, (_, i) => value[i] ?? "")
  )
  const [prevValue, setPrevValue] = useState(value)
  const [resetCount, setResetCount] = useState(0)

  // the parent clears the code (after a wrong one): empty the boxes during render
  // (no effect needed), then refocus the first box in the effect below
  if (value !== prevValue) {
    setPrevValue(value)
    if (value === "" && digits.some(Boolean)) {
      setDigits(Array(LENGTH).fill(""))
      setResetCount((c) => c + 1)
    }
  }

  // focus is a DOM side effect, so it belongs in an effect (it sets no state)
  useEffect(() => {
    if (resetCount > 0) refs.current[0]?.focus()
  }, [resetCount])

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  function commit(next: string[], focusIndex?: number) {
    setDigits(next)
    onChange(next.join(""))
    if (focusIndex !== undefined) refs.current[focusIndex]?.focus()
    if (!next.includes("")) onComplete?.(next.join(""))
  }

  function handleChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "")
    const next = [...digits]

    if (cleaned.length > 2) {
      // autofill (for example a code suggested by the phone) arrives in one go
      cleaned
        .slice(0, LENGTH)
        .split("")
        .forEach((c, i) => {
          if (i < LENGTH) next[i] = c
        })
      commit(next, Math.min(cleaned.length, LENGTH) - 1)
      return
    }

    next[index] = cleaned.slice(-1) // typing over a filled box replaces it
    commit(next, cleaned && index < LENGTH - 1 ? index + 1 : undefined)
  }

  function handlePaste(
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) {
    e.preventDefault()
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH)
    if (!text) return
    const next = [...digits]
    const start = text.length === LENGTH ? 0 : index // a full code always goes in from the first box
    text.split("").forEach((c, i) => {
      if (start + i < LENGTH) next[start + i] = c
    })
    commit(next, Math.min(start + text.length, LENGTH - 1))
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace") {
      e.preventDefault()
      const next = [...digits]
      if (digits[index]) {
        next[index] = ""
        commit(next)
      } else if (index > 0) {
        next[index - 1] = ""
        commit(next, index - 1)
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault()
      refs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      e.preventDefault()
      refs.current[index + 1]?.focus()
    }
  }

  return (
    <div role="group" aria-label={label} className="flex justify-center gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChange(i, e.target.value)}
          onPaste={(e) => handlePaste(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`h-12 w-10 rounded-lg border bg-input text-center text-base font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 ${
            invalid
              ? "border-destructive"
              : "border-border focus-visible:border-primary"
          }`}
        />
      ))}
    </div>
  )
}
