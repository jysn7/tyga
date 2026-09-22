import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import {
  toUpdateMemberInput,
  type MemberEditValues,
} from "@/lib/validations/member"

export function useUpdateMember(memberId: number) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: MemberEditValues) => {
      const { error } = await supabase.rpc(
        "update_member",
        toUpdateMemberInput(values, memberId)
      )
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      // Invalidate everything this member's detail page reads from —
      // overview data lives under ["members", id], but programmes/progression
      // are separate query keys that won't refetch on their own otherwise.
      queryClient.invalidateQueries({ queryKey: ["members", String(memberId)] })
    },
  })
}
