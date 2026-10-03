"use client"

import { useOnboardingPhase } from "@/hooks/shared/use-onboarding-state"
import { OnboardingChecklist } from "./onboarding-checklist"

export function OnboardingBlockSidebar() {
  const { phase } = useOnboardingPhase()

  if (phase !== "checklist") return null

  return <OnboardingChecklist />
}
