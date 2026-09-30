// hooks/lookups/use-lookups.ts

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

export type Venue = { id: number; name: string }
export type Level = { id: number; name: string }

export function useVenues() {
  return useQuery({
    queryKey: ["lookups", "venues"],
    queryFn: async (): Promise<Venue[]> => {
      const { data, error } = await supabase.rpc("get_venues")
      if (error) throw error
      return data as Venue[]
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useLevels() {
  return useQuery({
    queryKey: ["lookups", "levels"],
    queryFn: async (): Promise<Level[]> => {
      const { data, error } = await supabase.rpc("get_levels")
      if (error) throw error
      return data as Level[]
    },
    staleTime: 10 * 60 * 1000,
  })
}
