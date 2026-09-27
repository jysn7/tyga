"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/portals/shared/field"
import { createClient } from "@/utils/supabase/client"
import { toast } from "@/components/ui/toast"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const { resolvedTheme } = useTheme()

  const logoSrc =
    resolvedTheme === "dark" ? "/logo/light.png" : "/logo/dark.png"

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    const establishSession = async () => {
      const hash = window.location.hash

      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1))
        const access_token = params.get("access_token")
        const refresh_token = params.get("refresh_token")

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })

          if (error) {
            setValidSession(false)
            setCheckingSession(false)
            return
          }

          window.history.replaceState(null, "", window.location.pathname)
          setValidSession(true)
          setCheckingSession(false)
          return
        }
      }

      // Fall back to existing session (e.g. refresh after hash was consumed)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setValidSession(!!session)
      setCheckingSession(false)
    }

    establishSession()
  }, [supabase.auth])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.add({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        type: "error",
      })
      return
    }

    if (password.length < 8) {
      toast.add({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        type: "error",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast.add({
        title: "Password updated! 🎉",
        description: "Your password has been changed successfully.",
        type: "success",
      })

      setTimeout(() => {
        router.push("/auth/signin")
      }, 1500)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update password"

      toast.add({
        title: "Error",
        description: message,
        type: "error",
      })
      setLoading(false)
    }
  }

  // Still parsing the hash / checking for a session — avoid flashing the
  // "invalid link" state before we've actually finished checking.
  if (checkingSession) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm text-center text-sm text-muted-foreground">
          Verifying your invite link...
        </div>
      </div>
    )
  }

  // If no valid session, show error
  if (!validSession) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="flex flex-col items-center space-y-4">
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Invalid or expired link
              </h1>
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
            </div>
          </div>

          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary transition-colors hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
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
              Create new password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your new password below
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="flex flex-col">
          <Field label="New password">
            <Input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />
          </Field>

          <Field label="Confirm password">
            <Input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />
          </Field>

          {password && confirmPassword && password !== confirmPassword && (
            <p className="pt-2 text-xs text-destructive">
              Passwords don&apos;t match
            </p>
          )}

          <Button
            type="submit"
            className="mt-6 h-10 w-full rounded-lg text-xs font-medium"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground/60">
          By continuing, you agree to our{" "}
          <Link
            href="/help/terms"
            className="text-information underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/help/privacy"
            className="text-information underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
