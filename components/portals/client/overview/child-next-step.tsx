// components/portals/client/overview/child-next-step.tsx
"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useOnboardingState } from "@/hooks/shared/use-onboarding-state"
import { STEP_CONFIG } from "@/config/onboarding-config"
import type { OnboardingStep } from "@/hooks/shared/use-onboarding-state"

export function ChildNextStepHint({ memberId }: { memberId: number }) {
  const { data: state } = useOnboardingState()
  if (!state) return null

  // Determine this child's specific next step
  let step: OnboardingStep | null = null

  if (state.pendingAssessmentMemberIds.includes(memberId)) {
    step = "book-assessment"
  } else if (state.awaitingAssessmentMemberIds.includes(memberId)) {
    step = "await-assessment"
  } else if (state.unenrolledMemberIds.includes(memberId)) {
    step = "enrol"
  }

  if (!step) return null

  const config = STEP_CONFIG[step]
  if (!config) return null

  return (
    <Link
      href={config.href(memberId)}
      className="group mt-2 flex items-center gap-1.5 border-t border-border/40 pt-2 text-[11px] font-medium text-primary transition-colors hover:text-primary/80"
    >
      <span className="truncate">{config.label}</span>
      <ArrowRight
        className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5"
        strokeWidth={2}
      />
    </Link>
  )
}
