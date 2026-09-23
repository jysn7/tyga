import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Page() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-6">
      {/* Decorative shapes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Large soft circle top-right */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        {/* Smaller circle bottom-left */}
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        {/* Thin ring accent */}
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full border border-border/60" />

        {/* Diagonal accent */}
        <div className="absolute bottom-1/4 left-1/4 h-24 w-24 rotate-12 rounded-3xl bg-primary/5" />
      </div>

      {/* Content */}
      <div className="relative flex w-full max-w-md flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-2xl font-bold tracking-tight text-primary-foreground">
              T
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-[0.3em] text-foreground">
            TYGA
          </h1>
        </div>

        {/* Tagline */}
        <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
          Golf development for the next generation. Sign in to view your
          programmes, sessions, and progress.
        </p>

        {/* CTA */}
        <Link
          href="/auth/signin"
          className="group inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
        >
          Sign in
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.75}
          />
        </Link>

        {/* Footer */}
        <p className="text-[11px] text-muted-foreground/70">
          By signing in, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  )
}
