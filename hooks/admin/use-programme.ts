import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type ProgrammeType = "development" | "weekly_community" | "holiday_camp" | "clinic" | "corporate" | "league"
export type GenderRestriction = "male" | "female" | "any"

export type Programme = {
  id: number; name: string; type: ProgrammeType | null
  levelId: number | null; levelName: string | null
  venueId: number; venueName: string | null
  minAge: number | null; maxAge: number | null; genderRestriction: GenderRestriction | null
  recurrenceRule: string | null; termStart: string | null; termEnd: string | null
  capacity: number | null; price: number | null; maxRatio: number | null
  enrollmentCount: number // total, not filtered to 'active' — see note below
}

type ProgrammeRow = {
  id: number; name: string; type: ProgrammeType | null
  level_id: number | null; venue_id: number
  min_age: number | null; max_age: number | null; gender_restriction: GenderRestriction | null
  recurrence_rule: string | null; term_start: string | null; term_end: string | null
  capacity: number | null; price: number | null; max_ratio: number | null
  levels: { name: string } | null
  venues: { name: string } | null
  enrollments: { count: number }[]
}

function toProgramme(row: ProgrammeRow): Programme {
  return {
    id: row.id, name: row.name, type: row.type,
    levelId: row.level_id, levelName: row.levels?.name ?? null,
    venueId: row.venue_id, venueName: row.venues?.name ?? null,
    minAge: row.min_age, maxAge: row.max_age, genderRestriction: row.gender_restriction,
    recurrenceRule: row.recurrence_rule, termStart: row.term_start, termEnd: row.term_end,
    capacity: row.capacity, price: row.price, maxRatio: row.max_ratio,
    enrollmentCount: row.enrollments?.[0]?.count ?? 0,
  }
}

const PROGRAMME_SELECT = `*, levels ( name ), venues ( name ), enrollments ( count )`

export function useProgrammes(search?: string) {
  const supabase = createClient()
  const normalizedSearch = search?.trim().slice(0, 100) || undefined

  return useQuery({
    queryKey: ["admin-programmes", normalizedSearch ?? ""],
    queryFn: async (): Promise<Programme[]> => {
      let query = supabase.from("programmes").select(PROGRAMME_SELECT).order("term_start", { ascending: false })
      if (normalizedSearch) query = query.ilike("name", `%${normalizedSearch}%`)

      const { data, error } = await query
      if (error) throw error
      return (data as unknown as ProgrammeRow[]).map(toProgramme)
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useProgramme(programmeId: number | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-programmes", "detail", programmeId],
    queryFn: async (): Promise<Programme | null> => {
      const { data, error } = await supabase
        .from("programmes")
        .select(PROGRAMME_SELECT)
        .eq("id", programmeId as number)
        .maybeSingle() // returns null instead of throwing when no row matches
      if (error) throw error
      return data ? toProgramme(data as unknown as ProgrammeRow) : null
    },
    enabled: programmeId !== null,
  })
}