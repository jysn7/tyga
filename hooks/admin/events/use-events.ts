"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { Event } from "@/lib/types"

type EventFilters = {
  search?: string
  upcoming?: boolean
  status?: string
}

type RawEventRow = {
  id: number
  name: string | null
  type: string | null
  description: string | null
  image_url: string | null
  venue_id: number | null
  venue_name: string | null
  event_date: string | null
  start_time: string | null
  entry_fee: number | string | null
  capacity: number | string | null
  min_age: number | string | null
  max_age: number | string | null
  status: string | null
  registered_count: number | string | null
}

// Map a raw Supabase row (snake_case) to the Event type (camelCase)
function mapEvent(row: RawEventRow): Event {
  return {
    id: row.id,
    name: row.name ?? "",
    type: row.type ?? "",
    description: row.description ?? null,
    imageUrl: row.image_url ?? null,
    venueId: row.venue_id ?? 0,
    venueName: row.venue_name ?? "",
    eventDate: row.event_date ?? "",
    startTime: row.start_time ?? null,
    entryFee: Number(row.entry_fee ?? 0),
    capacity: row.capacity == null ? null : Number(row.capacity),
    minAge: row.min_age == null ? null : Number(row.min_age),
    maxAge: row.max_age == null ? null : Number(row.max_age),
    status: (row.status as Event["status"]) ?? "draft",
    registeredCount: Number(row.registered_count ?? 0),
  }
}

export function useEvents(filters?: EventFilters) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_events", {
        p_event_id: null,
        p_search: filters?.search ?? null,
        p_upcoming: filters?.upcoming ?? null,
        p_status: filters?.status ?? null,
      })
      if (error) throw error
      return (data ?? []).map(mapEvent)
    },
  })
}

export function useEvent(eventId: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["events", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_event", {
        p_event_id: eventId,
      })
      if (error) throw error
      return data?.[0] ? mapEvent(data[0]) : null
    },
    enabled: !!eventId,
  })
}

export function useEventRegistrations(eventId: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["events", eventId, "registrations"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "admin_get_event_registrations",
        {
          p_event_id: eventId,
        }
      )
      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}
