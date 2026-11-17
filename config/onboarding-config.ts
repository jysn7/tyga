import type { OnboardingStep } from "@/hooks/shared/use-onboarding-state"
import type { LucideIcon } from "lucide-react"
import {
  UserPlus,
  CalendarCheck,
  Clock,
  CreditCard,
  GraduationCap,
} from "lucide-react"

export type StepConfig = {
  step: OnboardingStep
  label: string
  description: string
  ctaLabel: string
  href: (memberId?: number) => string
  icon: LucideIcon
}

export const STEP_CONFIG: Record<OnboardingStep, StepConfig | null> = {
  "add-child": {
    step: "add-child",
    label: "Add your first child",
    description: "Create your child's profile to begin their TYGA journey.",
    ctaLabel: "Add a child",
    href: () => "/members/new",
    icon: UserPlus,
  },

  "book-assessment": {
    step: "book-assessment",
    label: "Book a skills assessment",
    description:
      "A coach will watch them swing and place them in the right level.",
    ctaLabel: "Book assessment",
    href: (id) => (id ? `/my-appointments` : "/members"),
    icon: CalendarCheck,
  },

  "await-assessment": {
    step: "await-assessment",
    label: "Awaiting coach confirmation",
    description: "Your coach will confirm their level after the session.",
    ctaLabel: "View member",
    href: (id) => (id ? `/members/${id}` : "/members"),
    icon: Clock,
  },

  "pay-membership": {
    step: "pay-membership",
    label: "Set up membership",
    description:
      "Membership unlocks enrolment in every programme. Takes a minute to set up.",
    ctaLabel: "Set up membership",
    href: () => "/billing/membership",
    icon: CreditCard,
  },

  enrol: {
    step: "enrol",
    label: "Enrol in a programme",
    description: "Pick a programme that matches their level and schedule.",
    ctaLabel: "Browse programmes",
    href: (id) => (id ? `/programmes?member=${id}` : "/programmes"),
    icon: GraduationCap,
  },

  done: null,
}

export type MemberScopedStep = "book-assessment" | "await-assessment" | "enrol"

export function isMemberScopedStep(
  step: OnboardingStep
): step is MemberScopedStep {
  return (
    step === "book-assessment" ||
    step === "await-assessment" ||
    step === "enrol"
  )
}

export function getActiveMemberId(
  step: MemberScopedStep,
  state: {
    pendingAssessmentMemberIds: number[]
    awaitingAssessmentMemberIds: number[]
    unenrolledMemberIds: number[]
  }
): number | undefined {
  switch (step) {
    case "book-assessment":
      return state.pendingAssessmentMemberIds[0]
    case "await-assessment":
      return state.awaitingAssessmentMemberIds[0]
    case "enrol":
      return state.unenrolledMemberIds[0]
  }
}
