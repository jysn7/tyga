import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { AppointmentType } from "@/hooks/use-appointment-slots"

const supabase = createClient()

// ============================================================
// Availability rules
// ============================================================

export type AvailabilityRule = {
  id: number
  venueId: number
  venueName: string
  levelId: number | null
  levelName: string | null
  type: AppointmentType
  dayOfWeek: number
  startTime: string
  endTime: string
  slotMinutes: number
  capacity: number
  validFrom: string
  validUntil: string | null
  archivedAt: string | null
}

type AvailabilityRuleRow = {
  id: number
  venue_id: number
  venue_name: string
  level_id: number | null
  level_name: string | null
  type: AppointmentType
  day_of_week: number
  start_time: string
  end_time: string
  slot_minutes: number
  capacity: number
  valid_from: string
  valid_until: string | null
  archived_at: string | null
}

function toRule(row: AvailabilityRuleRow): AvailabilityRule {
  return {
    id: row.id,
    venueId: row.venue_id,
    venueName: row.venue_name,
    levelId: row.level_id,
    levelName: row.level_name,
    type: row.type,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    slotMinutes: row.slot_minutes,
    capacity: row.capacity,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    archivedAt: row.archived_at,
  }
}

export function useCoachRules() {
  return useQuery({
    queryKey: ["coach", "availability-rules"],
    queryFn: async (): Promise<AvailabilityRule[]> => {
      const { data, error } = await supabase.rpc("coach_get_own_rules")
      if (error) throw error
      return (data as AvailabilityRuleRow[]).map(toRule)
    },
  })
}

export function useCreateAvailabilityRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      venueId: number
      dayOfWeek: number
      startTime: string
      endTime: string
      slotMinutes?: number
      levelId?: number | null
      type?: AppointmentType
      capacity?: number
      validFrom?: string
      validUntil?: string | null
    }) => {
      const { data, error } = await supabase.rpc(
        "coach_create_availability_rule",
        {
          p_venue_id: input.venueId,
          p_day_of_week: input.dayOfWeek,
          p_start_time: input.startTime,
          p_end_time: input.endTime,
          p_slot_minutes: input.slotMinutes ?? 60,
          p_level_id: input.levelId ?? null,
          p_type: input.type ?? "assessment",
          p_capacity: input.capacity ?? 1,
          p_valid_from:
            input.validFrom ?? new Date().toISOString().slice(0, 10),
          p_valid_until: input.validUntil ?? null,
        }
      )
      if (error) throw error
      return data as number
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["coach", "availability-rules"],
      })
    },
  })
}

export function useArchiveAvailabilityRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ruleId: number) => {
      const { error } = await supabase.rpc("coach_archive_availability_rule", {
        p_rule_id: ruleId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["coach", "availability-rules"],
      })
    },
  })
}

export function useApplyAvailabilityRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { ruleId: number; weeksAhead?: number }) => {
      const { data, error } = await supabase.rpc(
        "coach_apply_availability_rule",
        {
          p_rule_id: input.ruleId,
          p_weeks_ahead: input.weeksAhead ?? 6,
        }
      )
      if (error) throw error
      return data as number
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-slots"] })
    },
  })
}

// ============================================================
// Blocks
// ============================================================

export type CoachBlock = {
  id: number
  startsAt: string
  endsAt: string
  reason: string | null
  createdAt: string
}

type CoachBlockRow = {
  id: number
  starts_at: string
  ends_at: string
  reason: string | null
  created_at: string
}

function toBlock(row: CoachBlockRow): CoachBlock {
  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    reason: row.reason,
    createdAt: row.created_at,
  }
}

export function useCoachBlocks() {
  return useQuery({
    queryKey: ["coach", "blocks"],
    queryFn: async (): Promise<CoachBlock[]> => {
      const { data, error } = await supabase.rpc("coach_get_own_blocks")
      if (error) throw error
      return (data as CoachBlockRow[]).map(toBlock)
    },
  })
}

export function useAddBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      startsAt: string
      endsAt: string
      reason?: string
    }) => {
      const { data, error } = await supabase.rpc("coach_add_block", {
        p_starts_at: input.startsAt,
        p_ends_at: input.endsAt,
        p_reason: input.reason ?? null,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach", "blocks"] })
      queryClient.invalidateQueries({ queryKey: ["appointment-slots"] })
    },
  })
}

export function useRemoveBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (blockId: number) => {
      const { error } = await supabase.rpc("coach_remove_block", {
        p_block_id: blockId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach", "blocks"] })
    },
  })
}
