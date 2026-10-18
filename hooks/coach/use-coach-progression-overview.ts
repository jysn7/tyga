import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

type MemberRow = {
  id: number
  full_name: string
  current_level_id: number | null
}

type LevelRow = {
  id: number
  name: string
  sort_order: number
  goal: string | null
}

type ModuleRow = {
  id: number
  level_id: number
  name: string
  category: string | null
  is_milestone: boolean
}

type MilestoneRow = {
  id: number
  member_id: number
  curriculum_module_id: number
  completed_at: string | null
}

type ProgressionRow = {
  id: number
  member_id: number
  from_level_id: number
  to_level_id: number
  date: string
  badge_complete: boolean
  notes: string | null
}

export type CoachProgressionStudent = {
  id: number
  fullName: string
  currentLevel: LevelRow | null
  modules: (ModuleRow & { completed: boolean })[]
  history: {
    id: number
    date: string
    fromLevel: string
    toLevel: string
    badgeComplete: boolean
    notes: string | null
  }[]
}

export type CoachProgressionOverview = {
  students: CoachProgressionStudent[]
  levels: LevelRow[]
}

export function useCoachProgressionOverview() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["coach-progression-overview"],
    staleTime: 30_000,
    queryFn: async (): Promise<CoachProgressionOverview> => {
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("member_id")
        .eq("status", "active")

      if (enrollmentError) throw new Error(enrollmentError.message)

      const memberIds = Array.from(
        new Set((enrollmentData ?? []).map((row) => row.member_id))
      )

      const [levelsResult, modulesResult] = await Promise.all([
        supabase
          .from("levels")
          .select("id, name, sort_order, goal")
          .is("archived_at", null)
          .order("sort_order"),
        supabase
          .from("curriculum_modules")
          .select("id, level_id, name, category, is_milestone")
          .is("archived_at", null),
      ])

      if (levelsResult.error) throw new Error(levelsResult.error.message)
      if (modulesResult.error) throw new Error(modulesResult.error.message)

      const levels = (levelsResult.data ?? []) as LevelRow[]
      const modules = (modulesResult.data ?? []) as ModuleRow[]

      if (memberIds.length === 0) {
        return { students: [], levels }
      }

      const [membersResult, milestonesResult, progressionsResult] =
        await Promise.all([
          supabase
            .from("members")
            .select("id, full_name, current_level_id")
            .in("id", memberIds)
            .order("full_name"),
          supabase
            .from("member_milestones")
            .select("id, member_id, curriculum_module_id, completed_at")
            .in("member_id", memberIds),
          supabase
            .from("level_progressions")
            .select(
              "id, member_id, from_level_id, to_level_id, date, badge_complete, notes"
            )
            .in("member_id", memberIds)
            .order("date", { ascending: false }),
        ])

      if (membersResult.error) throw new Error(membersResult.error.message)
      if (milestonesResult.error)
        throw new Error(milestonesResult.error.message)
      if (progressionsResult.error)
        throw new Error(progressionsResult.error.message)

      const members = (membersResult.data ?? []) as MemberRow[]
      const milestones = (milestonesResult.data ?? []) as MilestoneRow[]
      const progressions = (progressionsResult.data ?? []) as ProgressionRow[]
      const levelNames = new Map(levels.map((level) => [level.id, level.name]))

      return {
        levels,
        students: members.map((member) => {
          const completedModuleIds = new Set(
            milestones
              .filter(
                (milestone) =>
                  milestone.member_id === member.id && milestone.completed_at
              )
              .map((milestone) => milestone.curriculum_module_id)
          )

          return {
            id: member.id,
            fullName: member.full_name,
            currentLevel:
              levels.find((level) => level.id === member.current_level_id) ??
              null,
            modules: modules
              .filter((module) => module.level_id === member.current_level_id)
              .map((module) => ({
                ...module,
                completed: completedModuleIds.has(module.id),
              })),
            history: progressions
              .filter((progression) => progression.member_id === member.id)
              .map((progression) => ({
                id: progression.id,
                date: progression.date,
                fromLevel:
                  levelNames.get(progression.from_level_id) ??
                  `Level ${progression.from_level_id}`,
                toLevel:
                  levelNames.get(progression.to_level_id) ??
                  `Level ${progression.to_level_id}`,
                badgeComplete: progression.badge_complete,
                notes: progression.notes,
              })),
          }
        }),
      }
    },
  })
}
