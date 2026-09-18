"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

const EVENTS_QUERY_KEY = ["events"]

type EventInput = {
  name: string
  venueId: number
  eventDate: string
  type?: string
  startTime?: string | null
  entryFee?: number
  capacity?: number | null
  minAge?: number | null
  maxAge?: number | null
  description?: string | null
  imageUrl?: string | null
  status?: string
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: EventInput) => {
      const { data, error } = await supabase.rpc("admin_create_event", {
        p_name: input.name,
        p_venue_id: input.venueId,
        p_event_date: input.eventDate,
        p_type: input.type ?? "tournament",
        p_start_time: input.startTime ?? null,
        p_entry_fee: input.entryFee ?? 0,
        p_capacity: input.capacity ?? null,
        p_min_age: input.minAge ?? null,
        p_max_age: input.maxAge ?? null,
        p_description: input.description ?? null,
        p_image_url: input.imageUrl ?? null,
        p_status: input.status ?? "active",
      })
      if (error) throw error
      return data as number
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY }),
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: EventInput & { eventId: number }) => {
      const { error } = await supabase.rpc("admin_update_event", {
        p_event_id: input.eventId,
        p_name: input.name,
        p_venue_id: input.venueId,
        p_event_date: input.eventDate,
        p_type: input.type ?? null,
        p_start_time: input.startTime ?? null,
        p_entry_fee: input.entryFee ?? null,
        p_capacity: input.capacity ?? null,
        p_min_age: input.minAge ?? null,
        p_max_age: input.maxAge ?? null,
        p_description: input.description ?? null,
        p_image_url: input.imageUrl ?? null,
        p_status: input.status ?? null,
      })
      if (error) throw error
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY }),
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (eventId: number) => {
      const { error } = await supabase.rpc("admin_delete_event", {
        p_event_id: eventId,
      })
      if (error) throw error
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY }),
  })
}
