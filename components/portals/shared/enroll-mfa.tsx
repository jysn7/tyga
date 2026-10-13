// components/auth/enroll-mfa.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

const supabase = createClient()

type Props = {
  nextPath: string
  onEnrolled?: () => void
}

// Only allow same-site paths
const safeNext = (p: string) =>
  p?.startsWith("/") && !p.startsWith("//") ? p : "/dashboard"

// Supabase returns the QR as SVG markup (or sometimes already as a data URL)
const qrSrc = (qr: string) =>
  qr.startsWith("data:")
    ? qr
    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`

export function EnrollMFA({ nextPath, onEnrolled }: Props) {
  const router = useRouter()
  const startedRef = useRef(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const [qr, setQr] = useState("")
  const [secret, setSecret] = useState("")
  const [factorId, setFactorId] = useState("")
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [copied, setCopied] = useState(false)

  const code = digits.join("")
  const isComplete = code.length === 6 && !digits.includes("")

  const startEnrollment = useCallback(async () => {
    setLoading(true)
    setError(null)
    setDigits(Array(6).fill(""))

    const { data: existing } = await supabase.auth.mfa.listFactors()
    const stale =
      existing?.all?.filter(
        (f) => f.factor_type === "totp" && f.status === "unverified"
      ) ?? []
    for (const f of stale) {
      await supabase.auth.mfa.unenroll({ factorId: f.id })
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${Math.random().toString(36).slice(2, 7)}`,
    })

    if (error || !data) {
      setError(error?.message ?? "Could not start setup. Please try again.")
      setLoading(false)
      return
    }

    setQr(data.totp.qr_code)
    setSecret(data.totp.secret)
    setFactorId(data.id)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    startEnrollment()
  }, [startEnrollment])

  useEffect(() => {
    if (!loading && inputsRef.current[0]) {
      inputsRef.current[0].focus()
    }
  }, [loading])

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
      // Clipboard unavailable — silently ignore
    }
  }

  const handleVerify = async () => {
    if (!factorId || !isComplete || verifying) return

    setError(null)
    setVerifying(true)

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId })

    if (challengeError || !challenge) {
      setError(challengeError?.message ?? "Could not start verification.")
      setVerifying(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })

    if (verifyError) {
      setError(verifyError.message)
      setVerifying(false)
      setDigits(Array(6).fill(""))
      inputsRef.current[0]?.focus()
      return
    }

    await supabase.auth.refreshSession()

    onEnrolled?.()
    router.replace(safeNext(nextPath))
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-xs text-muted-foreground">Preparing enrollment…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
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
        </div>
      )}

      {qr && (
        <>
          <div className="flex flex-col items-center gap-3">
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
                  disabled={verifying}
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
              disabled={!isComplete || verifying}
              onClick={handleVerify}
            >
              {verifying ? "Verifying…" : "Enable two-factor"}
            </Button>
          </div>
        </>
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
              onClick={startEnrollment}
            >
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
