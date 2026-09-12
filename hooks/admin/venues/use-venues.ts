// hooks/admin/venues/use-venues.ts
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { Venue } from "@/lib/types"

type VenueRow = {
  id: number
  name: string
  address: string
  type: Venue["type"]
  latitude: number | null
  longitude: number | null
  programme_count: number
}

export type AdminVenue = {
  id: number
  name: string
  address: string
  type: Venue["type"]
  latitude: number | null
  longitude: number | null
  programmeCount: number
}

function toVenue(row: VenueRow): AdminVenue {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    type: row.type,
    latitude: row.latitude,
    longitude: row.longitude,
    programmeCount: row.programme_count,
  }
}

export function useVenues({ search }: { search?: string } = {}) {
  const supabase = createClient()
  const normalizedSearch = search?.trim().slice(0, 100) || undefined

  return useQuery({
    queryKey: ["admin-venues", normalizedSearch ?? ""],
    queryFn: async (): Promise<AdminVenue[]> => {
      const { data, error } = await supabase.rpc("admin_get_venues", {
        p_venue_id: null,
        p_search: normalizedSearch ?? null,
      })
      if (error) throw error
      return (data as VenueRow[]).map(toVenue)
    },
    placeholderData: (previousData) => previousData,
  })
}
