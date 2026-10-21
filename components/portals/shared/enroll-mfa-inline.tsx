"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Copy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useStartTotpEnrollment,
  useVerifyTotpEnrollment,
  useCancelTotpEnrollment,
  qrSrc,
} from "@/hooks/shared/use-mfa"

type Props = {
  onDone: () => void
  onCancel: () => void
}

export function EnrollMfaInline({ onDone, onCancel }: Props) {
  const start = useStartTotpEnrollment()
  const verify = useVerifyTotpEnrollment()
  const cancel = useCancelTotpEnrollment()

  const startedRef = useRef(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const [factorId, setFactorId] = useState("")
  const [qr, setQr] = useState("")
  const [secret, setSecret] = useState("")
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const code = digits.join("")
  const isComplete = code.length === 6 && !digits.includes("")

  const begin = useCallback(() => {
    setError(null)
    setDigits(Array(6).fill(""))
    setQr("")
    setSecret("")
    setFactorId("")

    start.mutate(
      {},
      {
        onSuccess: (data) => {
          setFactorId(data.factorId)
          setQr(data.qr)
          setSecret(data.secret)
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Could not start setup")
        },
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    begin()
  }, [begin])

  useEffect(() => {
    if (qr && inputsRef.current[0]) {
      inputsRef.current[0].focus()
    }
  }, [qr])

  function handleDigitChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "")

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split("")
      const next = [...digits]
      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c
      })
      setDigits(next)
      const focusIndex = Math.min(index + chars.length, 5)
      inputsRef.current[focusIndex]?.focus()
      return
    }

    const next = [...digits]
    next[index] = cleaned
    setDigits(next)

    if (cleaned && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ""
        setDigits(next)
      } else if (index > 0) {
        const next = [...digits]
        next[index - 1] = ""
        setDigits(next)
        inputsRef.current[index - 1]?.focus()
      }
      e.preventDefault()
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus()
      e.preventDefault()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus()
      e.preventDefault()
    }
  }

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  function handleVerify() {
    if (!factorId || !isComplete || verify.isPending) return
    setError(null)

    verify.mutate(
      { factorId, code },
      {
        onSuccess: () => {
          onDone()
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "That code didn't work")
          setDigits(Array(6).fill(""))
          inputsRef.current[0]?.focus()
        },
      }
    )
  }

  function handleCancel() {
    if (factorId) {
      cancel.mutate(factorId, {
        onSettled: () => onCancel(),
      })
    } else {
      onCancel()
    }
  }

  if (start.isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground">Preparing enrollment…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Add authenticator
        </span>
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancel.isPending}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
      </div>

      {qr && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-white p-3">
            <Image
              src={qrSrc(qr)}
              alt="Authenticator QR code"
              width={176}
              height={176}
              unoptimized
            />
          </div>
          <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
            Scan this code with Google Authenticator, Authy, 1Password, or any
            TOTP-compatible app.
          </p>

          {secret && (
            <div className="flex w-full max-w-xs flex-col items-center gap-2">
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                Can&apos;t scan? Enter this key manually:
              </p>
              <button
                type="button"
                onClick={copySecret}
                className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted"
                aria-label="Copy setup key"
              >
                <code className="min-w-0 flex-1 truncate font-mono text-[11px] tracking-wider text-foreground">
                  {secret}
                </code>
                <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" strokeWidth={2} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" strokeWidth={1.75} />
                      Copy
                    </>
                  )}
                </span>
              </button>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 pt-1">
            <label className="text-xs font-medium text-muted-foreground">
              Enter the 6-digit code
            </label>
            <div className="flex justify-center gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={verify.isPending}
                  className="h-12 w-10 rounded-lg border border-border bg-input text-center text-base font-medium text-foreground transition-colors outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
              disabled={!isComplete || verify.isPending}
              onClick={handleVerify}
            >
              {verify.isPending ? "Verifying…" : "Enable two-factor"}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex flex-col gap-2">
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
          {!qr && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-fit rounded-md text-xs font-medium"
              onClick={begin}
            >
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
