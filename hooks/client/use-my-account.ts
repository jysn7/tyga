// hooks/client/use-my-account.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export function useMyAccount() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["account", "me"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_account").single()
      if (error) throw error
      return data as {
        id: string
        role: string
        full_name: string | null
        email: string | null
        phone: string | null
        address: string | null
        avatar_url: string | null
        active: boolean
        created_at: string
        membership_status:
          | "pending"
          | "active"
          | "non_renewing"
          | "cancelled"
          | "attention"
          | null
        membership_current_period_end: string | null
      }
    },
    staleTime: 30_000,
  })
}
