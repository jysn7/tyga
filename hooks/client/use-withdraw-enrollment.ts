import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type WithdrawReason =
  "schedule_clash" | "cost" | "moved_away" | "lost_interest" | "other"

export const WITHDRAW_REASONS: { value: WithdrawReason; label: string }[] = [
  { value: "schedule_clash", label: "The schedule doesn't work for us" },
  { value: "cost", label: "Cost" },
  { value: "moved_away", label: "We've moved away" },
  { value: "lost_interest", label: "My child lost interest" },
  { value: "other", label: "Something else" },
]

export type WithdrawResult = {
  enrollment_id: number
  status: string
  already: boolean
  refund_review: boolean
  invoice_cancelled: boolean
}

export function useWithdrawEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      enrollmentId: number
      reason: WithdrawReason
      note?: string
    }): Promise<WithdrawResult> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("parent_withdraw_enrollment", {
        p_enrollment_id: input.enrollmentId,
        p_reason_code: input.reason,
        p_reason_note: input.note?.trim() || null,
      })
      if (error) throw new Error(error.message)
      return data as WithdrawResult
    },
    // Programmes, schedule, invoices, notifications and the dashboard all change.
    // Narrow this to your own query keys later if you like.
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}
