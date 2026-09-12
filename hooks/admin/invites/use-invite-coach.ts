// hooks/admin/coaches/use-invite-coach.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"

export type InviteCoachInput = {
  email: string
  coachType?: "head_coach" | "assistant_coach" | "volunteer"
  maxStudentRatio?: number
}

export function useInviteCoach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: InviteCoachInput) => {
      const res = await fetch("/api/admin/invite-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: input.email,
          coachType: input.coachType,
          maxStudentRatio: input.maxStudentRatio,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to send invite")
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coach-invites"] })
    },
  })
}
