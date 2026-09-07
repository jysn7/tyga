// hooks/admin/programmes/use-programmes.ts
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type ProgrammeType =
  | "development"
  | "weekly_community"
  | "holiday_camp"
  | "clinic"
  | "corporate"
  | "league"

export type AdminProgramme = {
  id: number
  name: string
  type: ProgrammeType
  levelId: number | null
  levelName: string | null
  venueId: number | null
  venueName: string | null
  minAge: number
  maxAge: number
  genderRestriction: "male" | "female" | "any"
  recurrenceRule: string | null
  termStart: string | null
  termEnd: string | null
  price: number
  capacity: number
  maxRatio: number | null
  enrolledCount: number
  archivedAt: string | null
  createdAt: string
}

type ProgrammeRow = {
  id: number
  name: string
  type: ProgrammeType
  level_id: number | null
  level_name: string | null
  venue_id: number | null
  venue_name: string | null
  min_age: number
  max_age: number
  gender_restriction: "male" | "female" | "any"
  recurrence_rule: string | null
  term_start: string | null
  term_end: string | null
  price: number
  capacity: number
  max_ratio: number | null
  enrolled_count: number
  archived_at: string | null
  created_at: string
}

function toProgramme(row: ProgrammeRow): AdminProgramme {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    levelId: row.level_id,
    levelName: row.level_name,
    venueId: row.venue_id,
    venueName: row.venue_name,
    minAge: row.min_age,
    maxAge: row.max_age,
    genderRestriction: row.gender_restriction,
    recurrenceRule: row.recurrence_rule,
    termStart: row.term_start,
    termEnd: row.term_end,
    price: row.price,
    capacity: row.capacity,
    maxRatio: row.max_ratio,
    enrolledCount: row.enrolled_count,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
  }
}

export type UseProgrammesFilters = {
  search?: string
  levelId?: number
  archived?: boolean | null
}

export function useProgrammes({
  search,
  levelId,
  archived = false,
}: UseProgrammesFilters = {}) {
  const supabase = createClient()
  const normalizedSearch = search?.trim().slice(0, 100) || undefined

  return useQuery({
    queryKey: [
      "admin-programmes",
      normalizedSearch ?? "",
      levelId ?? "all",
      archived ?? "all",
    ],
    queryFn: async (): Promise<AdminProgramme[]> => {
      const { data, error } = await supabase.rpc("admin_get_programmes", {
        p_programme_id: null,
        p_search: normalizedSearch ?? null,
        p_level_id: levelId ?? null,
        p_archived: archived ?? false,
      })
      if (error) throw error
      return (data as ProgrammeRow[]).map(toProgramme)
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useProgramme(id: number | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-programme", id],
    enabled: !!id,
    queryFn: async (): Promise<AdminProgramme | null> => {
      if (!id) return null
      const { data, error } = await supabase.rpc("admin_get_programme", {
        p_programme_id: id,
      })
      if (error) throw error
      if (!data) return null
      return toProgramme(data as ProgrammeRow)
    },
  })
}

// ---------- Venues ----------

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

// ---------- Levels ----------

export function useLevels() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-levels"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_levels")
      if (error) throw error
      return data as { id: number; name: string }[]
    },
  })
}

// ---------- Programme Coaches ----------

export type ProgrammeCoach = {
  coachId: number
  fullName: string
  email: string
  roleInProgramme: string
}

type ProgrammeCoachRow = {
  coach_id: number
  full_name: string
  email: string
  role_in_programme: string
}

function toProgrammeCoach(row: ProgrammeCoachRow): ProgrammeCoach {
  return {
    coachId: row.coach_id,
    fullName: row.full_name,
    email: row.email,
    roleInProgramme: row.role_in_programme,
  }
}

export function useGetProgrammeCoaches(programmeId: number | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-programme-coaches", programmeId],
    enabled: !!programmeId,
    queryFn: async (): Promise<ProgrammeCoach[]> => {
      if (!programmeId) return []
      const { data, error } = await supabase.rpc(
        "admin_get_programme_coaches",
        {
          p_programme_id: programmeId,
        }
      )
      if (error) throw error
      return (data as ProgrammeCoachRow[]).map(toProgrammeCoach)
    },
  })
}

// ---------- Sessions ----------

export type Session = {
  id: number
  programmeId: number
  programmeName: string
  sessionDate: string
  startTime: string
  endTime: string
  venueId: number
  venueName: string
  status: string
  coachNotes: string
  coachCount: number
  enrolledCount: number
  attendanceCount: number
}

type SessionRow = {
  id: number
  programme_id: number
  programme_name: string
  session_date: string
  start_time: string
  end_time: string
  venue_id: number
  venue_name: string
  status: string
  coach_notes: string
  coach_count: number
  enrolled_count: number
  attendance_count: number
}

function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    programmeId: row.programme_id,
    programmeName: row.programme_name,
    sessionDate: row.session_date,
    startTime: row.start_time,
    endTime: row.end_time,
    venueId: row.venue_id,
    venueName: row.venue_name,
    status: row.status,
    coachNotes: row.coach_notes,
    coachCount: row.coach_count,
    enrolledCount: row.enrolled_count,
    attendanceCount: row.attendance_count,
  }
}

export function useGetSessions(programmeId?: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-sessions", programmeId],
    enabled: !!programmeId,
    queryFn: async (): Promise<Session[]> => {
      if (!programmeId) return []
      const { data, error } = await supabase.rpc("admin_get_sessions", {
        p_programme_id: programmeId,
      })
      if (error) throw error
      return (data as SessionRow[]).map(toSession)
    },
  })
}
// ---------- Session Modules ----------

export type SessionModule = {
  id: number
  name: string
  category: string
  description: string
  isMilestone: boolean
}

export function useGetSessionModules(sessionId: number | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-session-modules", sessionId],
    enabled: !!sessionId,
    queryFn: async (): Promise<SessionModule[]> => {
      if (!sessionId) return []
      const { data, error } = await supabase.rpc("admin_get_session_modules", {
        p_session_id: sessionId,
      })
      if (error) throw error
      return data as SessionModule[]
    },
  })
}

// ------------ Session Coaches -
export type SessionCoach = {
  coachId: number
  fullName: string
  email: string
  roleInSession: string
}

type SessionCoachRow = {
  coach_id: number
  full_name: string
  email: string
  role_in_session: string
}

function toSessionCoach(row: SessionCoachRow): SessionCoach {
  return {
    coachId: row.coach_id,
    fullName: row.full_name,
    email: row.email,
    roleInSession: row.role_in_session,
  }
}

export function useGetSessionCoaches(sessionId: number | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-session-coaches", sessionId],
    enabled: !!sessionId,
    queryFn: async (): Promise<SessionCoach[]> => {
      if (!sessionId) return []
      const { data, error } = await supabase.rpc("admin_get_session_coaches", {
        p_session_id: sessionId,
      })
      if (error) throw error
      return (data as SessionCoachRow[]).map(toSessionCoach)
    },
  })
}
