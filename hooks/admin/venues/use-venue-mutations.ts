// hooks/admin/venues/use-venue-mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { VenueType } from "@/lib/types"

const VALID_VENUE_TYPES: VenueType[] = [
  "course",
  "practice_ground",
  "range",
  "school",
]

function assertVenueType(type: string): VenueType {
  if (!VALID_VENUE_TYPES.includes(type as VenueType)) {
    throw new Error(`Invalid venue type: ${type}`)
  }
  return type as VenueType
}

export type VenueInput = {
  name: string
  address: string
  type: string
  latitude?: number | null
  longitude?: number | null
}

function useInvalidateVenues() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ["admin-venues"] })
}

export function useCreateVenue() {
  const supabase = createClient()
  const invalidate = useInvalidateVenues()

  return useMutation({
    mutationFn: async (input: VenueInput) => {
      const { data, error } = await supabase.rpc("admin_create_venue", {
        p_name: input.name,
        p_address: input.address,
        p_type: assertVenueType(input.type),
        p_latitude: input.latitude ?? null,
        p_longitude: input.longitude ?? null,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: invalidate,
  })
}

export function useUpdateVenue() {
  const supabase = createClient()
  const invalidate = useInvalidateVenues()

  return useMutation({
    mutationFn: async (input: Partial<VenueInput> & { venueId: number }) => {
      const { error } = await supabase.rpc("admin_update_venue", {
        p_venue_id: input.venueId,
        p_name: input.name ?? null,
        p_address: input.address ?? null,
        p_type: input.type ? assertVenueType(input.type) : null,
        p_latitude: input.latitude ?? null,
        p_longitude: input.longitude ?? null,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

// Replaces useToggleVenueArchive — this schema has no archive concept.
// Delete is real and can fail if the venue is still referenced anywhere
// (programmes, sessions, appointments, bookings, events) — the RPC raises
// a specific error message per blocking table, surfaced via err.message.
export function useDeleteVenue() {
  const supabase = createClient()
  const invalidate = useInvalidateVenues()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("admin_delete_venue", {
        p_venue_id: id,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}
