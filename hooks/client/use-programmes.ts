"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type {
  EnrollableMember,
  ProgrammeCoachDetail,
  ProgrammeDetail,
  ProgrammeListItem,
  ProgrammeSession,
} from "@/lib/types"

type ProgrammeListRow = {
  id?: number
  name?: string
  type?: string
  level_id?: number | null
  level_name?: string | null
  venue_id?: number | null
  venue_name?: string | null
  recurrence_rule?: string | null
  price?: number | string | null
  capacity?: number | null
  enrolled_count?: number | string | null
  max_ratio?: number | null
  min_age?: number | null
  max_age?: number | null
  gender_restriction?: string | null
  already_enrolled?: boolean
}

type ProgrammeDetailRow = ProgrammeListRow & {
  level_goal?: string | null
  level_focus_summary?: string | null
  venue_address?: string | null
  coaches?: ProgrammeCoachDetail[] | null
  curriculum_modules?: ProgrammeDetail["curriculumModules"] | null
  upcoming_sessions?: ProgrammeSession[] | null
  is_eligible?: boolean | null
}

type EnrollableMemberRow = {
  id: number
  full_name: string
  is_eligible: boolean
  reason: string | null
  programme_full?: boolean
}

// ---------- Programmes list ----------

export function useProgrammes(
  memberId: number | null,
  allProgrammes: boolean = false
) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["programmes", allProgrammes ? "all" : memberId],
    queryFn: async (): Promise<ProgrammeListItem[]> => {
      const fn = allProgrammes
        ? "parent_get_all_programmes"
        : "parent_get_programmes"
      const params = allProgrammes ? {} : { p_member_id: memberId }

      console.log("[useProgrammes] calling", fn, "with", params)

      const { data, error } = await supabase.rpc(fn, params)

      if (error) {
        console.error("[useProgrammes] error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fn,
          params,
        })
        throw error
      }

      console.log("[useProgrammes] raw data:", data)

      return ((data as ProgrammeListRow[] | null) ?? []).map((row) => ({
        id: row.id ?? 0,
        name: row.name ?? "Untitled",
        type: row.type ?? "",
        levelId: row.level_id ?? null,
        levelName: row.level_name ?? null,
        venueId: row.venue_id ?? null,
        venueName: row.venue_name ?? null,
        recurrenceRule: row.recurrence_rule ?? null,
        price: Number(row.price ?? 0),
        capacity: row.capacity ?? 0,
        enrolledCount: Number(row.enrolled_count ?? 0),
        maxRatio: row.max_ratio ?? null,
        minAge: row.min_age ?? 0,
        maxAge: row.max_age ?? 0,
        genderRestriction: row.gender_restriction ?? null,
        alreadyEnrolled: row.already_enrolled ?? false,
      })) as ProgrammeListItem[]
    },
    enabled: allProgrammes || memberId !== null,
  })
}

// ---------- Programme detail ----------

export function useProgrammeDetail(
  programmeId: number,
  memberId: number | null
) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["programme", programmeId, memberId],
    queryFn: async (): Promise<ProgrammeDetail> => {
      const params = {
        p_programme_id: programmeId,
        p_member_id: memberId,
      }

      console.log(
        "[useProgrammeDetail] calling parent_get_programme_detail with",
        params
      )

      const { data, error } = await supabase.rpc(
        "parent_get_programme_detail",
        params
      )

      if (error) {
        console.error("[useProgrammeDetail] error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          params,
        })
        throw error
      }

      console.log("[useProgrammeDetail] raw data:", data)

      const row = (data as ProgrammeDetailRow[] | null)?.[0]
      if (!row) throw new Error("Programme not found")

      console.log("[useProgrammeDetail] row keys:", Object.keys(row))

      const sessionsRaw = row.upcoming_sessions ?? []
      const sessions = sessionsRaw.map((session) => ({
        id: session.id,
        sessionDate: session.session_date,
        startTime: session.start_time ?? "",
        endTime: session.end_time ?? "",
      }))

      return {
        id: row.id ?? 0,
        name: row.name ?? "Untitled Programme",
        type: row.type ?? "",
        levelId: row.level_id ?? null,
        levelName: row.level_name ?? null,
        levelGoal: row.level_goal ?? null,
        levelFocusSummary: row.level_focus_summary ?? null,
        venueId: row.venue_id ?? 0,
        venueName: row.venue_name ?? "",
        venueAddress: row.venue_address ?? null,
        minAge: row.min_age ?? 0,
        maxAge: row.max_age ?? 0,
        genderRestriction: row.gender_restriction ?? null,
        recurrenceRule: row.recurrence_rule ?? null,
        price: Number(row.price ?? 0),
        capacity: row.capacity ?? 0,
        enrolledCount: Number(row.enrolled_count ?? 0),
        maxRatio: row.max_ratio ?? null,
        coaches: Array.isArray(row.coaches) ? row.coaches : [],
        curriculumModules: Array.isArray(row.curriculum_modules)
          ? row.curriculum_modules
          : [],
        upcomingSessions: sessionsRaw,
        sessions,
        isEligible: row.is_eligible ?? null,
        alreadyEnrolled: row.already_enrolled ?? false,
      }
    },
  })
}

// ---------- Enrollable members ----------

export function useEnrollableMembers(programmeId: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["enrollable-members", programmeId],
    enabled: Number.isFinite(programmeId) && programmeId > 0,
    queryFn: async (): Promise<EnrollableMember[]> => {
      if (!programmeId || programmeId <= 0) return []

      const { data, error } = await supabase.rpc(
        "parent_get_enrollable_members",
        {
          p_programme_id: programmeId,
        }
      )
      if (error) throw error

      return ((data as EnrollableMemberRow[] | null) ?? []).map((row) => ({
        id: row.id,
        fullName: row.full_name,
        isEligible: row.is_eligible, // ← the key line
        reason: row.reason,
        programmeFull: row.programme_full,
      })) as EnrollableMember[]
    },
  })
}
