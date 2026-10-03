// components/portals/client/overview/next-step-banner.tsx

"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { useOnboardingPhase } from "@/hooks/shared/use-onboarding-state"

import { STEP_CONFIG, getActiveMemberId } from "@/config/onboarding-config"

export function NextStepBanner() {
  const { state, phase } = useOnboardingPhase()

  if (phase !== "banner" || !state) {
    return null
  }

  const config = STEP_CONFIG[state.nextStep]

  if (!config) {
    return null
  }

  const memberId =
    state.nextStep === "book-assessment" ||
    state.nextStep === "await-assessment" ||
    state.nextStep === "enrol"
      ? getActiveMemberId(state.nextStep, state)
      : undefined

  const Icon = config.icon

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm sm:items-center">
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-foreground">
          Next: {config.label}
        </span>

        <span className="line-clamp-2 text-xs text-muted-foreground sm:truncate">
          {config.description}
        </span>
      </div>

      {/* CTA — full width on mobile, inline on sm+ */}
      <Link
        href={config.href(memberId)}
        className="group inline-flex h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90 sm:h-8 sm:w-auto"
      >
        <span className="hidden sm:inline">{config.ctaLabel}</span>
        <span className="sm:hidden">Continue</span>

        <ArrowRight
          className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
          strokeWidth={1.75}
        />
      </Link>
    </div>
  )
}
