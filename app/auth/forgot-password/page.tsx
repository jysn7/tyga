"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, fieldStyles } from "@/components/portals/shared/field"
import { createClient } from "@/utils/supabase/client"
import { toast } from "@/components/ui/toast"
import { useTheme } from "next-themes"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const { resolvedTheme } = useTheme()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const logoSrc =
    resolvedTheme === "dark" ? "/logo/light.png" : "/logo/dark.png"

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) throw error

      setSent(true)
      toast.add({
        title: "Check your email",
        description: "We've sent you a password reset link.",
        type: "success",
      })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong"

      toast.add({
        title: "Error",
        description: message,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-secondary px-4 py-12 dark:bg-background">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password.
              </p>
            </div>
          </div>

          <Link
            href="/auth/signin"
            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-secondary text-xs font-medium text-foreground transition-colors hover:bg-accent/30 hover:text-accent-foreground"
          >
            Back to sign in
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
              Reset password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>
        </div>

        <form onSubmit={handleResetPassword} className="flex flex-col">
          <Field label="Email address">
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldStyles}
              required
              disabled={loading}
            />
          </Field>

          <Button
            type="submit"
            className="mt-6 h-10 w-full rounded-lg text-xs font-medium"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </Button>

          <Link
            href="/auth/signin"
            className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-secondary text-xs font-medium text-foreground transition-colors hover:bg-accent/30 hover:text-accent-foreground"
          >
            Back to sign in
          </Link>
        </form>

        <p className="text-center text-[11px] text-muted-foreground/60">
          We&apos;ll only use your email to help you regain access to your
          account. See our{" "}
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
