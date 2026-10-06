// hooks/client/use-membership.ts
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useCreateSubscription() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "create-subscription"
      )
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data as {
        authorization_url: string
        access_code: string
        reference: string
      }
    },
  })
}

export function useCancelSubscription() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "cancel-subscription"
      )
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing", "summary"] })
      qc.invalidateQueries({ queryKey: ["account"] })
    },
  })
}
