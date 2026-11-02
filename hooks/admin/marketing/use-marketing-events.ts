"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import { eventSchema, type EventInput } from "@/lib/validations/marketing/event"

export type MarketingEvent = {
  id: number
  name: string
  type: string | null
  min_age: number | null
  max_age: number | null
  venue_id: number | null
  event_date: string | null
  start_time: string | null
  description: string | null
  image_url: string | null
  entry_fee: number | null
  capacity: number | null
  status: string | null
  sort_order: number
  visibility: "draft" | "published" | "archived"
  published_at: string | null
  updated_at: string
  updated_by: string | null
}

const KEY = "marketing-events"

export function useMarketingEvents() {
  const supabase = createClient()
  return useQuery({
    queryKey: [KEY],
    queryFn: async (): Promise<MarketingEvent[]> => {
      const { data, error } = await supabase.rpc("admin_get_events")
      if (error) throw new Error(error.message)
      return (data ?? []) as MarketingEvent[]
    },
  })
}

export function useUpsertMarketingEvent() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id?: number; input: EventInput }) => {
      const parsed = eventSchema.safeParse(input)
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid input")
      }
      const v = parsed.data

      const { data, error } = await supabase.rpc("admin_upsert_event", {
        p_id: id ?? null,
        p_name: v.name,
        p_type: v.type,
        p_venue_id: v.venueId,
        p_event_date: v.eventDate,
        p_start_time: v.startTime || null,
        p_description: v.description || null,
        p_image_url: v.imageUrl ?? null,
        p_entry_fee: v.entryFee ?? null,
        p_capacity: v.capacity ?? null,
        p_sort_order: v.sortOrder,
        p_visibility: v.visibility,
      })
      if (error) throw new Error(error.message)
      return data as number
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}

export function useDeleteMarketingEvent() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("admin_delete_event", { p_id: id })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}

export function useToggleEventPublished() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      currentlyPublished,
      event,
    }: {
      id: number
      currentlyPublished: boolean
      event: MarketingEvent
    }) => {
      const { error } = await supabase.rpc("admin_upsert_event", {
        p_id: id,
        p_name: event.name,
        p_type: event.type,
        p_venue_id: event.venue_id,
        p_event_date: event.event_date,
        p_start_time: event.start_time,
        p_description: event.description,
        p_image_url: event.image_url,
        p_entry_fee: event.entry_fee,
        p_capacity: event.capacity,
        p_sort_order: event.sort_order,
        p_visibility: currentlyPublished ? "draft" : "published",
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}
