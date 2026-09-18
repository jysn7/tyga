import { useMutation, useQueryClient } from "@tanstack/react-query"

export type InviteCoachInput = {
  email: string
  coachType?: "head_coach" | "assistant_coach" | "volunteer"
  maxStudentRatio?: number | null
}

type InviteCoachResponse = {
  inviteId?: number
  error?: string
}

export function useInviteCoach() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: InviteCoachInput) => {
      const response = await fetch("/api/admin/invite-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      // Read as text first so we can safely handle non-JSON responses
      const text = await response.text()

      let data: InviteCoachResponse | null = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        // Not JSON — likely an HTML error page or empty body
        console.error("Non-JSON response from invite-coach:", text)
        throw new Error(
          `Server error (${response.status}). Check the terminal for the real error.`
        )
      }

      if (!response.ok) {
        throw new Error(data?.error || `Request failed (${response.status})`)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coach-invites"] })
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] })
    },
  })
}
