"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import { Field } from "@/components/portals/shared/field"
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth"
import { useSignUp, useGoogleAuth } from "@/hooks/use-auth-mutations"

type Strength = {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
  barColor: string
  hints: string[]
}

const STRENGTH_CONFIG: Record<
  Strength["score"],
  Pick<Strength, "label" | "color" | "barColor">
> = {
  0: {
    label: "Too weak",
    color: "text-destructive",
    barColor: "bg-destructive",
  },
  1: {
    label: "Weak",
    color: "text-destructive",
    barColor: "bg-destructive",
  },
  2: {
    label: "Fair",
    color: "text-amber-600 dark:text-amber-500",
    barColor: "bg-amber-500",
  },
  3: {
    label: "Good",
    color: "text-emerald-600 dark:text-emerald-500",
    barColor: "bg-emerald-500",
  },
  4: {
    label: "Strong",
    color: "text-emerald-600 dark:text-emerald-500",
    barColor: "bg-emerald-500",
  },
}

function evaluatePassword(password: string): Strength {
  if (!password) {
    return {
      score: 0,
      label: "Enter a password",
      color: "text-muted-foreground",
      barColor: "bg-muted",
      hints: [],
    }
  }

  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password)
  const isLong = password.length >= 12

  // Length is the anchor. Variety adds on top. A long passphrase can
  // hit "Strong" on length + any one bucket; a short password needs
  // several buckets to climb.
  let score = 0
  if (password.length >= 8) score++
  if (isLong) score++
  if (hasLower && hasUpper) score++
  if (hasDigit || hasSymbol) score++
  if (hasDigit && hasSymbol) score++

  const finalScore = Math.min(score, 4) as Strength["score"]

  const hints: string[] = []
  if (password.length < 8) hints.push("Use at least 8 characters")
  else if (!isLong) hints.push("12+ characters is stronger")
  if (!hasLower || !hasUpper) hints.push("Mix upper & lowercase")
  if (!hasDigit && !hasSymbol) hints.push("Add a number or symbol")
  else if (!hasSymbol) hints.push("Add a symbol")
  else if (!hasDigit) hints.push("Add a number")

  return { score: finalScore, hints, ...STRENGTH_CONFIG[finalScore] }
}

export default function SignupPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()

  // One shared toggle for both password fields
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const logoSrc =
    resolvedTheme === "dark" ? "/logo/light.png" : "/logo/dark.png"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  })

  const passwordRegister = register("password")
  const confirmPasswordRegister = register("confirmPassword")

  const signUp = useSignUp()
  const googleAuth = useGoogleAuth()

  const strength = useMemo(() => evaluatePassword(password), [password])

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  const onSubmit = async (values: SignUpValues) => {
    const toastId = "signup-status"

    toast.add({
      id: toastId,
      title: "Creating account...",
      description: "Please wait",
      type: "loading",
      timeout: 0,
    })

    try {
      const payload = { ...values }
      delete payload.confirmPassword
      await signUp.mutateAsync(payload)

      toast.close(toastId)
      toast.add({
        title: "Account created! 🎉",
        description: "Check your email to verify your account.",
        type: "success",
        timeout: 5000,
      })

      router.push(
        "/auth/verify-email?email=" + encodeURIComponent(values.email)
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred during sign up"

      toast.close(toastId)
      toast.add({
        title: "Sign up failed",
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred"

      toast.close(toastId)
      toast.add({
        title: "Google sign in failed",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  const loading = signUp.isPending || googleAuth.isPending

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
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Get started with your TYGA account
            </p>
          </div>

          <div className="flex w-full rounded-lg bg-background p-1 text-xs">
            <Link
              href="/auth/signin"
              className="flex-1 rounded-md py-1.5 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <div className="flex-1 rounded-md bg-card py-1.5 text-center font-medium text-foreground shadow-sm">
              Create Account
            </div>
          </div>
        </div>

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
            Sign up with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <Separator className="w-full bg-border/60" />
            <span className="absolute rounded-full bg-muted px-3 text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <Field label="Full name" error={errors.fullName?.message}>
              <Input
                type="text"
                placeholder="Sarah Conner"
                disabled={loading}
                aria-invalid={!!errors.fullName}
                {...register("fullName")}
              />
            </Field>

            <Field label="Email address" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="name@example.com"
                disabled={loading}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  disabled={loading}
                  aria-invalid={!!errors.password}
                  className="pr-10"
                  {...passwordRegister}
                  onChange={(e) => {
                    passwordRegister.onChange(e)
                    setPassword(e.target.value)
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength.score ? strength.barColor : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`text-[11px] font-medium ${strength.color}`}
                    >
                      {strength.label}
                    </span>
                    {strength.hints.length > 0 && (
                      <span className="text-right text-[11px] text-muted-foreground">
                        {strength.hints.slice(0, 2).join(" · ")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Field>

            <Field
              label="Confirm password"
              error={errors.confirmPassword?.message}
            >
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  disabled={loading}
                  aria-invalid={!!errors.confirmPassword || passwordsMismatch}
                  className="pr-10"
                  {...confirmPasswordRegister}
                  onChange={(e) => {
                    confirmPasswordRegister.onChange(e)
                    setConfirmPassword(e.target.value)
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {passwordsMismatch && !errors.confirmPassword && (
                <p className="mt-2 text-[11px] font-medium text-destructive">
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-500">
                  Passwords match
                </p>
              )}
            </Field>

            <Button
              type="submit"
              className="mt-6 h-10 w-full rounded-lg text-xs font-medium"
              disabled={loading}
            >
              {signUp.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60">
          By signing up, you agree to our{" "}
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
