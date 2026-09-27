"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  LineChart,
  Receipt,
  ShieldCheck,
  Users,
  Check,
} from "lucide-react"

const features = [
  {
    icon: CalendarDays,
    title: "Scheduling & sessions",
    text: "Upcoming sessions, venues, and coach assignments. Reminders before every session.",
  },
  {
    icon: GraduationCap,
    title: "Levels & progression",
    text: "Modules, milestones, and badges as your child moves up. Every sign-off is coach-confirmed.",
  },
  {
    icon: LineChart,
    title: "Progress reports",
    text: "Attendance, skills, and coach notes after each session. Visible the moment they're logged.",
  },
  {
    icon: Receipt,
    title: "Invoices & payments",
    text: "Term fees, instalments, and receipts in one place. Card or EFT, no surprise charges.",
  },
  {
    icon: Users,
    title: "Multiple children",
    text: "Every child under one account, each with their own profile, level, and history.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    text: "Medical details are visible only to coaches assigned to your child. Every view is logged.",
  },
]

const stats = [
  { value: "1", label: "Free assessment before you enrol" },
  { value: "4", label: "Venues across Johannesburg" },
  { value: "1:4 – 1:12", label: "Coach-to-student ratios" },
  { value: "100%", label: "Progress visible to parents" },
]

const primaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
const secondaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-muted/60 px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
const navBtn =
  "inline-flex h-8 items-center justify-center rounded-full bg-muted/60 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"

export default function PortalLandingPage() {
  const { resolvedTheme } = useTheme()

  const logoSrc =
    resolvedTheme === "dark" ? "/logo/light.png" : "/logo/dark.png"

  return (
    <div className="flex w-full flex-col overflow-x-hidden bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 w-full bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/50">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
              {resolvedTheme && (
                <Image
                  width={24}
                  height={24}
                  alt="TYGA"
                  src={logoSrc}
                  className="h-6 w-6 object-contain"
                  priority
                />
              )}
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              TYGA
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full bg-muted/60 p-1 text-xs md:flex">
            <Link
              href="/how-it-works"
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              How it works
            </Link>
            <Link
              href="/how-it-works/programmes"
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              Programmes
            </Link>
            <Link
              href="/how-it-works/pricing"
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              Pricing
            </Link>
          </nav>

          <Link href="/auth/signin" className={navBtn}>
            Sign in
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 0%, color-mix(in oklab, var(--muted) 70%, transparent), transparent 70%)",
          }}
        />
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
          <p className="text-sm text-muted-foreground">
            The TYGA parent portal
          </p>
          <h1 className="max-w-2xl text-3xl leading-[1.1] font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Your child&apos;s golf journey, in one place.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sessions, progress, invoices, and coach feedback. Everything you
            need to follow their journey from first swing to competitive play.
          </p>

          <div className="mt-2 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link href="/auth/signin" className={primaryBtn}>
              Sign in
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <Link href="/how-it-works" className={secondaryBtn}>
              See how it works
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            No app download. Works in any browser.
          </p>
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto w-full max-w-5xl">
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-6 top-1/3 -bottom-10 -z-10 rounded-[40px] bg-muted/60 blur-2xl sm:-inset-x-10"
            />
            <div className="overflow-hidden rounded-xl bg-card shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)] ring-1 ring-black/5 dark:ring-white/5">
              {/* macOS window chrome */}
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2.5">
                <span className="h-3 w-3 shrink-0 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 shrink-0 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 shrink-0 rounded-full bg-[#28c840]" />
                <span className="ml-2 truncate text-[11px] text-muted-foreground">
                  Members · Emma M.
                </span>
              </div>

              {/* App content */}
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
                {/* Sidebar */}
                <aside className="hidden flex-col gap-6 bg-muted/30 p-5 lg:flex">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Current level
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      Skill Building
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Modules
                    </span>
                    <ul className="flex flex-col gap-1.5">
                      {[
                        "Full-swing consistency",
                        "Chipping and pitching",
                        "Green reading basics",
                        "Introductory rules",
                      ].map((item, i) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] ${
                              i < 2
                                ? "bg-foreground text-background"
                                : "bg-muted"
                            }`}
                          >
                            {i < 2 && (
                              <Check className="h-2.5 w-2.5" strokeWidth={3} />
                            )}
                          </span>
                          <span
                            className={
                              i < 2
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>

                {/* Main panel */}
                <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-6">
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      { label: "Sessions", value: "34" },
                      { label: "Attendance", value: "94%" },
                      { label: "Badges", value: "7" },
                      { label: "Term fee", value: "R1,200" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex min-w-0 flex-col gap-1 rounded-lg bg-muted/50 p-3"
                      >
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {s.label}
                        </span>
                        <span className="text-lg font-semibold tracking-tight text-foreground">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex min-w-0 flex-col gap-2 rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        Latest coach note
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        2 days ago
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      &ldquo;Emma&apos;s chipping has come a long way this term.
                      We&apos;re starting to introduce green reading next
                      week.&rdquo;
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      Coach Ryan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 pb-12 text-center">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            Built for parents, not spreadsheets.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Stay on top of your child&apos;s development without chasing coaches
            for updates or digging through email for invoices.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-sm transition-colors hover:bg-muted/60"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-foreground shadow-sm">
                <f.icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-medium text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto w-full max-w-5xl rounded-2xl bg-card px-6 py-10 sm:px-10 sm:py-12">
          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 text-center"
              >
                <span className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {s.value}
                </span>
                <span className="max-w-[16ch] text-xs leading-relaxed text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center sm:px-8 sm:py-12">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Sign in to view your programmes, sessions, and progress.
            </p>
          </div>
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link href="/how-it-works" className={secondaryBtn}>
              How it works
            </Link>
            <Link href="/auth/signin" className={primaryBtn}>
              Sign in
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 pb-8 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-2 py-4 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center">
              {resolvedTheme && (
                <Image
                  width={16}
                  height={16}
                  alt="TYGA"
                  src={logoSrc}
                  className="h-4 w-4 object-contain"
                />
              )}
            </div>
            <span>© {new Date().getFullYear()} TYGA</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
