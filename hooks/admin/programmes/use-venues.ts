import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type Venue = { id: number; name: string }

export function useVenues() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-venues"],
    queryFn: async (): Promise<Venue[]> => {
      const { data, error } = await supabase.rpc("admin_get_venues")

      if (error) {
        console.error("Error fetching admin venues:", error)
        throw error
      }

      if (!data) {
        console.warn("admin_get_venues RPC returned no data (null/undefined)")
        return []
      }

      return data as Venue[]
    },
  })
}
