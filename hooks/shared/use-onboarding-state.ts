"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type OnboardingStep =
  | "add-child"
  | "book-assessment"
  | "await-assessment"
  | "pay-membership"
  | "enrol"
  | "done"

type OnboardingStateRow = {
  account_id: string
  setup_completed_at: string | null
  checklist_dismissed_at: string | null
  has_children: boolean
  pending_assessment_member_ids: number[]
  awaiting_assessment_member_ids: number[]
  unenrolled_member_ids: number[]
  next_step: OnboardingStep
}

export type OnboardingState = {
  setupCompletedAt: string | null
  checklistDismissedAt: string | null
  hasChildren: boolean
  pendingAssessmentMemberIds: number[]
  awaitingAssessmentMemberIds: number[]
  unenrolledMemberIds: number[]
  nextStep: OnboardingStep
}

function toState(row: OnboardingStateRow): OnboardingState {
  return {
    setupCompletedAt: row.setup_completed_at,
    checklistDismissedAt: row.checklist_dismissed_at,
    hasChildren: row.has_children,
    pendingAssessmentMemberIds: row.pending_assessment_member_ids ?? [],
    awaitingAssessmentMemberIds: row.awaiting_assessment_member_ids ?? [],
    unenrolledMemberIds: row.unenrolled_member_ids ?? [],
    nextStep: row.next_step,
  }
}

export function useOnboardingState() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["onboarding-state"],
    queryFn: async (): Promise<OnboardingState> => {
      const { data, error } = await supabase
        .rpc("get_my_onboarding_state")
        .single<OnboardingStateRow>()

      if (error) throw error
      if (!data) throw new Error("No onboarding state returned")

      return toState(data)
    },
    staleTime: 30_000,
  })
}

// ---------------------------------------------------------------------------
// Derive the account-level phase (checklist / banner / hidden)
// ---------------------------------------------------------------------------

export type OnboardingPhase = "hidden" | "checklist" | "banner"

export function useOnboardingPhase(): {
  state: OnboardingState | undefined
  isLoading: boolean
  phase: OnboardingPhase
  showChecklist: boolean
  showBanner: boolean
  isComplete: boolean
} {
  const { data: state, isLoading } = useOnboardingState()

  const isComplete =
    Boolean(state?.setupCompletedAt) || state?.nextStep === "done"

  const dismissed = Boolean(state?.checklistDismissedAt)

  let phase: OnboardingPhase = "hidden"

  if (!isLoading && !isComplete) {
    phase = dismissed ? "banner" : "checklist"
  }

  return {
    state,
    isLoading,
    phase,
    showChecklist: phase === "checklist",
    showBanner: phase === "banner",
    isComplete,
  }
}

// ---------------------------------------------------------------------------
// Dismiss checklist (DB-backed)
// ---------------------------------------------------------------------------

export function useDismissChecklist() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("dismiss_onboarding_checklist")

      if (error) throw error
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["onboarding-state"],
      })
    },
  })
}

// ---------------------------------------------------------------------------
// Optional reset hook (for testing/admin tools only)
// ---------------------------------------------------------------------------

export function useResetChecklist() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("reset_onboarding_checklist")

      if (error) throw error
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["onboarding-state"],
      })
    },
  })
}
