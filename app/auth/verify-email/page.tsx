"use client"

import { Suspense, use, useState } from "react"
import { Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

function VerifyEmailContent({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = use(searchParams)
  const { resolvedTheme } = useTheme()
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)

  const logoSrc =
    resolvedTheme === "dark" ? "/logo/light.png" : "/logo/dark.png"

  async function handleResend() {
    setIsResending(true)
    await new Promise((r) => setTimeout(r, 800))
    setIsResending(false)
    setResent(true)
  }

  return (
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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{params.email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to confirm your account.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-lg text-xs font-medium"
          disabled={isResending}
          onClick={handleResend}
        >
          {isResending
            ? "Sending…"
            : resent
              ? "Email sent"
              : "Resend verification email"}
        </Button>

        <Link
          href="/auth/signin"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Already verified? Sign in
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={null}>
        <VerifyEmailContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
