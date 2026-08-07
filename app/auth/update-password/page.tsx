"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { toast } from "@/components/ui/toast"

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border/60 py-3 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}

const fieldStyles =
  "h-auto border-none bg-transparent px-0 shadow-none text-[15px] text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setValidSession(!!session)
    }
    checkSession()
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

  // If no valid session, show error
  if (!validSession) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="flex flex-col items-center space-y-4">
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            T
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
              className={fieldStyles}
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
              className={fieldStyles}
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

        <p className="text-center font-mono text-[11px] text-muted-foreground/60">
          TYGA Portal &bull; Press{" "}
          <kbd className="rounded bg-muted px-1 py-0.5">d</kbd> for theme
        </p>
      </div>
    </div>
  )
}
