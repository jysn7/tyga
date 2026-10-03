"use client"

import { useOnboardingPhase } from "@/hooks/shared/use-onboarding-state"
import { OnboardingChecklist } from "./onboarding-checklist"
import { NextStepBanner } from "./next-step-banner"

export function OnboardingBlock() {
  const { phase } = useOnboardingPhase()

  if (phase === "hidden") return null

  return (
    <>
      <div className="lg:hidden">
        <OnboardingChecklist />
      </div>
      <NextStepBanner />
    </>
  )
}
