"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import { signInSchema, type SignInValues } from "@/lib/validations/auth"
import { useSignIn, useGoogleAuth } from "@/hooks/use-auth-mutations"

function Field({
  label,
  action,
  children,
  error,
}: {
  label: string
  action?: React.ReactNode
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        {action}
      </div>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}

const fieldStyles =
  "h-auto border-none bg-background active:ring active:ring-primary pl-2 py-3 shadow-none text-[15px] text-foreground placeholder:text-muted-foreground/50"

export default function LoginPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()

  const logoSrc =
    resolvedTheme === "dark" ? "/logo/light.png" : "/logo/dark.png"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  })

  const signIn = useSignIn()
  const googleAuth = useGoogleAuth()

  const onSubmit = async (values: SignInValues) => {
    const toastId = "signin-status"

    toast.add({
      id: toastId,
      title: "Signing in...",
      description: "Please wait",
      type: "loading",
      timeout: 0,
    })

    try {
      await signIn.mutateAsync(values)

      toast.close(toastId)
      router.push("/dashboard?toast=auth-success")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid email or password"

      toast.add({
        id: toastId,
        title: "Sign in failed",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  const handleGoogleAuth = async () => {
    const toastId = "google-auth-status"

    toast.add({
      id: toastId,
      title: "Redirecting to Google...",
      description: "Please wait",
      type: "loading",
      timeout: 0,
    })

    try {
      await googleAuth.mutateAsync()
      toast.close(toastId)
      // Browser navigates away to Google on success — nothing else to show
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred"

      toast.add({
        id: toastId,
        title: "Google sign in failed",
        description: message,
        type: "error",
        timeout: 5000, // was 100ms — too fast to actually read, fixed to 5s
      })
    }
  }

  const loading = signIn.isPending || googleAuth.isPending

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Top Branding & Mode Switcher */}
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
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your portal
            </p>
          </div>

          {/* Segmented Auth Switcher */}
          <div className="flex w-full rounded-lg bg-muted p-1 text-xs">
            <div className="flex-1 rounded-md bg-card py-1.5 text-center font-medium text-foreground shadow-sm">
              Sign In
            </div>
            <Link
              href="/auth/signup"
              className="flex-1 rounded-md py-1.5 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Main content — no card frame, just spacing */}
        <div className="flex flex-col gap-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full gap-2.5 rounded-lg bg-secondary text-xs font-medium shadow"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <Separator className="w-full bg-border/60" />
            <span className="absolute rounded-full bg-muted px-3 text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase">
              or
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <Field label="Email address" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="name@example.com"
                className={fieldStyles}
                disabled={loading}
                {...register("email")}
              />
            </Field>

            <Field
              label="Password"
              error={errors.password?.message}
              action={
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </Link>
              }
            >
              <Input
                type="password"
                placeholder="••••••••"
                className={fieldStyles}
                disabled={loading}
                {...register("password")}
              />
            </Field>

            <Button
              type="submit"
              className="mt-6 h-10 w-full rounded-lg text-xs font-medium"
              disabled={loading}
            >
              {signIn.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center font-mono text-[11px] text-muted-foreground/60">
          TYGA Portal &bull; Press{" "}
          <kbd className="rounded bg-muted px-1 py-0.5">d</kbd> for theme
        </p>
      </div>
    </div>
  )
}
