// hooks/admin/programmes/use-venues.ts
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type Venue = { id: number; name: string }

export function useVenues() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-venues"],
    queryFn: async (): Promise<Venue[]> => {
      const { data, error } = await supabase.rpc("admin_get_venues")
      if (error) throw error
      return data as Venue[]
    },
  })
}
