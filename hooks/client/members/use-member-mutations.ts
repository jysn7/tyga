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

      if (error) {
        throw new Error(error.message)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", String(memberId)],
      })

      queryClient.invalidateQueries({
        queryKey: ["members"],
      })
    },
  })
}

export function useArchiveMember(memberId: number) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("archive_member", {
        p_member_id: memberId,
      })

      if (error) {
        throw new Error(error.message)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members"],
      })

      queryClient.invalidateQueries({
        queryKey: ["members", String(memberId)],
      })

      queryClient.invalidateQueries({
        queryKey: ["onboarding-state"],
      })
    },
  })
}
