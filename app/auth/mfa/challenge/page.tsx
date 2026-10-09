// app/auth/mfa/challenge/page.tsx
"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

const supabase = createClient()

function MFAChallengeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") ?? "/"
  const { resolvedTheme } = useTheme()

  const logoSrc =
    resolvedTheme === "dark" ? "/logo/light.png" : "/logo/dark.png"

  const [factorId, setFactorId] = useState<string>("")
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [verifying, setVerifying] = useState<boolean>(false)

  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const code = digits.join("")
  const isComplete = code.length === 6 && !digits.includes("")

  useEffect(() => {
    let cancelled = false

    async function loadFactor() {
      const { data } = await supabase.auth.mfa.listFactors()
      if (cancelled) return

      const verified = data?.totp?.find((f) => f.status === "verified")
      if (verified) {
        setFactorId(verified.id)
      } else {
        router.replace(nextPath)
        return
      }
      setLoading(false)
    }

    loadFactor()

    return () => {
      cancelled = true
    }
  }, [router, nextPath])

  // Auto-focus the first input once factor is loaded
  useEffect(() => {
    if (!loading && inputsRef.current[0]) {
      inputsRef.current[0].focus()
    }
  }, [loading])

  function handleDigitChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "")

    // Handle paste: if the user pasted multiple digits, distribute them
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

    // Single digit
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
        // Clear current
        const next = [...digits]
        next[index] = ""
        setDigits(next)
      } else if (index > 0) {
        // Move back and clear
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

  async function handleVerify() {
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

    router.replace(nextPath)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-secondary px-4 py-12">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-16 -left-16 h-40 w-40 rotate-12 rounded-3xl bg-muted" />
          <div className="absolute -right-10 bottom-16 h-52 w-52 rounded-full bg-muted" />
          <div className="absolute -bottom-20 left-1/4 h-32 w-32 -rotate-6 rounded-2xl bg-card" />
        </div>
        <div className="relative z-10 h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-secondary px-4 py-12">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 h-40 w-40 rotate-12 rounded-3xl bg-muted" />
        <div className="absolute -right-10 bottom-16 h-52 w-52 rounded-full bg-muted" />
        <div className="absolute -bottom-20 left-1/4 h-32 w-32 -rotate-6 rounded-2xl bg-card" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            {resolvedTheme && (
              <Image
                width={36}
                height={36}
                alt="TYGA Logo"
                src={logoSrc}
                className="h-full w-full object-contain"
                priority
              />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Enter your code
            </h1>
            <p className="text-sm text-muted-foreground">
              Open your authenticator app and enter the 6-digit code for your
              account
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleVerify()
          }}
          className="flex flex-col gap-6"
        >
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
                className="h-14 w-12 rounded-lg border border-border bg-input text-center text-lg font-medium text-foreground transition-colors outline-none focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-50"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          <Button
            type="submit"
            className="h-10 w-full text-xs font-medium"
            disabled={!isComplete || verifying}
          >
            {verifying ? "Verifying..." : "Verify"}
          </Button>
        </form>

        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default function MFAChallengePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-secondary">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      }
    >
      <MFAChallengeContent />
    </Suspense>
  )
}
