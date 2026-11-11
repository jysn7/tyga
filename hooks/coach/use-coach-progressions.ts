"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// Types
// ============================================================

export type ProgressionBoardRow = {
  memberId: number
  fullName: string
  age: number
  gender: string | null
  levelId: number | null
  levelName: string | null
  nextLevelName: string | null
  programmes: string | null
  milestonesDone: number
  milestonesTotal: number
  progressPct: number
  ready: boolean
  stalled: boolean
  needsAttention: boolean
  noLevel: boolean
  lastActivityOn: string | null
  daysSinceActivity: number | null
  attendanceRate30d: number | null
  absencesInARow: number
  hasMedicalNotes: boolean
  notesCount: number
  totalCount: number
}

export type ProgressionSummary = {
  students: number
  ready: number
  no_level: number
  stalled: number
  promoted_30d: number
  milestones_7d: number
  levels: {
    level_id: number
    name: string
    order: number
    students: number
    ready: number
    avg_progress_pct: number | null
  }[]
  bottlenecks: {
    module_id: number
    name: string
    level_name: string
    students: number
    completed: number
    pct: number
  }[]
}

export type ModuleMatrix = {
  level: { id: number; name: string; upgrade_criteria: string | null } | null
  modules: {
    id: number
    name: string
    category: string | null
    description: string | null
  }[]
  students: {
    member_id: number
    full_name: string
    done_module_ids: number[]
    ready: boolean
  }[]
}

export type ProgressNote = {
  id: number
  note: string
  sharedWithParent: boolean
  levelName: string | null
  coachName: string | null
  createdAt: string
  isMine: boolean
  canDelete: boolean
}

export type ParentProgressNote = {
  id: number
  note: string
  levelName: string | null
  coachName: string | null
  createdAt: string
}

export type ProgressActivity = {
  kind: "milestone" | "promotion" | "note"
  memberId: number
  memberName: string
  title: string
  detail: string | null
  happenedAt: string
  coachName: string | null
}

// ============================================================
// Mappers
// ============================================================

const mapBoardRow = (r: any): ProgressionBoardRow => ({
  memberId: r.member_id,
  fullName: r.full_name,
  age: r.age,
  gender: r.gender ?? null,
  levelId: r.level_id ?? null,
  levelName: r.level_name ?? null,
  nextLevelName: r.next_level_name ?? null,
  programmes: r.programmes ?? null,
  milestonesDone: r.milestones_done ?? 0,
  milestonesTotal: r.milestones_total ?? 0,
  progressPct: r.progress_pct ?? 0,
  ready: !!r.ready,
  stalled: !!r.stalled,
  needsAttention: !!r.needs_attention,
  noLevel: !!r.no_level,
  lastActivityOn: r.last_activity_on ?? null,
  daysSinceActivity: r.days_since_activity ?? null,
  attendanceRate30d: r.attendance_rate_30d ?? null,
  absencesInARow: r.absences_in_a_row ?? 0,
  hasMedicalNotes: !!r.has_medical_notes,
  notesCount: Number(r.notes_count ?? 0),
  totalCount: Number(r.total_count ?? 0),
})

const mapNote = (n: any): ProgressNote => ({
  id: Number(n.id),
  note: n.note,
  sharedWithParent: !!n.shared_with_parent,
  levelName: n.level_name ?? null,
  coachName: n.coach_name ?? null,
  createdAt: n.created_at,
  isMine: !!n.is_mine,
  canDelete: !!n.can_delete,
})

const mapParentNote = (n: any): ParentProgressNote => ({
  id: Number(n.id),
  note: n.note,
  levelName: n.level_name ?? null,
  coachName: n.coach_name ?? null,
  createdAt: n.created_at,
})

const mapActivity = (a: any): ProgressActivity => ({
  kind: a.kind,
  memberId: a.member_id,
  memberName: a.member_name,
  title: a.title,
  detail: a.detail ?? null,
  happenedAt: a.happened_at,
  coachName: a.coach_name ?? null,
})

// ============================================================
// 1. READ HOOKS — board & summary
// ============================================================

export type ProgressionBoardParams = {
  programmeId?: number | null
  levelId?: number | null
  filter?:
    | "all"
    | "ready"
    | "stalled"
    | "attention"
    | "no_level"
    | "in_progress"
    | null
  search?: string | null
  sort?: "attention" | "progress" | "activity" | "name"
  stalledDays?: number
  limit?: number
  offset?: number
}

export function useProgressionBoard(params: ProgressionBoardParams = {}) {
  return useQuery({
    queryKey: ["progression-board", params],
    queryFn: async (): Promise<ProgressionBoardRow[]> => {
      const { data, error } = await createClient().rpc(
        "coach_get_progression_board",
        {
          p_programme_id: params.programmeId ?? null,
          p_level_id: params.levelId ?? null,
          p_filter: params.filter ?? null,
          p_search: params.search ?? null,
          p_sort: params.sort ?? "attention",
          p_stalled_days: params.stalledDays ?? 28,
          p_limit: params.limit ?? 30,
          p_offset: params.offset ?? 0,
        }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map(mapBoardRow)
    },
    staleTime: 30_000,
  })
}

export function useProgressionSummary(
  programmeId: number | null = null,
  stalledDays = 28
) {
  return useQuery({
    queryKey: ["progression-summary", programmeId, stalledDays],
    queryFn: async (): Promise<ProgressionSummary> => {
      const { data, error } = await createClient().rpc(
        "coach_get_progression_summary",
        {
          p_programme_id: programmeId,
          p_stalled_days: stalledDays,
        }
      )
      if (error) throw new Error(error.message)
      return data as ProgressionSummary
    },
    staleTime: 60_000,
  })
}

export function useModuleMatrix(
  levelId: number | null,
  programmeId: number | null = null
) {
  return useQuery({
    queryKey: ["module-matrix", levelId, programmeId],
    queryFn: async (): Promise<ModuleMatrix> => {
      const { data, error } = await createClient().rpc(
        "coach_get_module_matrix",
        {
          p_level_id: levelId,
          p_programme_id: programmeId,
        }
      )
      if (error) throw new Error(error.message)
      return data as ModuleMatrix
    },
    enabled: levelId !== null && levelId > 0,
    staleTime: 30_000,
  })
}

// ============================================================
// 2. READ HOOKS — notes & activity
// ============================================================

export function useProgressNotes(memberId: number | null, limit = 30) {
  return useQuery({
    queryKey: ["progress-notes", memberId, limit],
    queryFn: async (): Promise<ProgressNote[]> => {
      const { data, error } = await createClient().rpc(
        "coach_get_progress_notes",
        {
          p_member_id: memberId,
          p_limit: limit,
        }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map(mapNote)
    },
    enabled: memberId !== null && memberId > 0,
    staleTime: 15_000,
  })
}

export function useParentProgressNotes(memberId: number | null) {
  return useQuery({
    queryKey: ["parent-progress-notes", memberId],
    queryFn: async (): Promise<ParentProgressNote[]> => {
      const { data, error } = await createClient().rpc(
        "parent_get_progress_notes",
        {
          p_member_id: memberId,
        }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map(mapParentNote)
    },
    enabled: memberId !== null && memberId > 0,
    staleTime: 30_000,
  })
}

export function useProgressActivity(limit = 15) {
  return useQuery({
    queryKey: ["progress-activity", limit],
    queryFn: async (): Promise<ProgressActivity[]> => {
      const { data, error } = await createClient().rpc(
        "coach_get_progress_activity",
        {
          p_limit: limit,
        }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map(mapActivity)
    },
    staleTime: 30_000,
  })
}

// ============================================================
// 3. WRITE HOOKS — bulk module ticks
// ============================================================

export function useMarkModulesBulk() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: {
      marks: { memberId: number; moduleId: number }[]
      sessionId?: number | null
    }): Promise<
      {
        memberId: number
        moduleId: number
        alreadyCompleted: boolean
        levelNowComplete: boolean
      }[]
    > => {
      const payload = args.marks.map((m) => ({
        member_id: m.memberId,
        module_id: m.moduleId,
      }))
      const { data, error } = await createClient().rpc(
        "coach_mark_modules_bulk",
        {
          p_marks: payload,
          p_session_id: args.sessionId ?? null,
        }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map((r: any) => ({
        memberId: r.member_id,
        moduleId: r.module_id,
        alreadyCompleted: !!r.already_completed,
        levelNowComplete: !!r.level_now_complete,
      }))
    },
    onSuccess: (_data, args) => {
      args.marks.forEach((m) =>
        qc.invalidateQueries({ queryKey: ["member-progress", m.memberId] })
      )
      qc.invalidateQueries({ queryKey: ["coach-roster"] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["module-matrix"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

export function useUnmarkModulesBulk() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: {
      marks: { memberId: number; moduleId: number }[]
    }): Promise<number> => {
      const payload = args.marks.map((m) => ({
        member_id: m.memberId,
        module_id: m.moduleId,
      }))
      const { data, error } = await createClient().rpc(
        "coach_unmark_modules_bulk",
        {
          p_marks: payload,
        }
      )
      if (error) throw new Error(error.message)
      return Number(data ?? 0)
    },
    onSuccess: (_n, args) => {
      args.marks.forEach((m) =>
        qc.invalidateQueries({ queryKey: ["member-progress", m.memberId] })
      )
      qc.invalidateQueries({ queryKey: ["coach-roster"] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["module-matrix"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

// ============================================================
// 4. WRITE HOOKS — bulk promotion
// ============================================================

export function useAdvanceMembersBulk() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: {
      memberIds: number[]
      notes?: string | null
    }): Promise<
      {
        memberId: number
        ok: boolean
        message: string
        newLevelName: string | null
      }[]
    > => {
      const { data, error } = await createClient().rpc(
        "coach_advance_members_bulk",
        {
          p_member_ids: args.memberIds,
          p_notes: args.notes?.trim() || null,
        }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map((r: any) => ({
        memberId: r.member_id,
        ok: !!r.ok,
        message: r.message,
        newLevelName: r.new_level_name ?? null,
      }))
    },
    onSuccess: (_rows, args) => {
      args.memberIds.forEach((id) =>
        qc.invalidateQueries({ queryKey: ["member-progress", id] })
      )
      qc.invalidateQueries({ queryKey: ["coach-roster"] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

// ============================================================
// 5. WRITE HOOKS — notes
// ============================================================

export function useAddProgressNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: {
      memberId: number
      note: string
      share?: boolean
    }): Promise<number> => {
      const { data, error } = await createClient().rpc(
        "coach_add_progress_note",
        {
          p_member_id: args.memberId,
          p_note: args.note,
          p_share: args.share ?? false,
        }
      )
      if (error) throw new Error(error.message)
      return Number(data)
    },
    onSuccess: (_id, args) => {
      qc.invalidateQueries({ queryKey: ["progress-notes", args.memberId] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

export function useDeleteProgressNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: {
      noteId: number
      memberId: number
    }): Promise<void> => {
      const { error } = await createClient().rpc("coach_delete_progress_note", {
        p_id: args.noteId,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: ["progress-notes", args.memberId] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

// ============================================================
// 6. Legacy single-row wrappers (kept for existing callers)
// ============================================================

// These delegate to the per-row RPCs called by the bulk wrappers in the
// migration. Only use them when you have exactly one row to touch.
export function useMarkModuleComplete() {
  const bulk = useMarkModulesBulk()
  return {
    ...bulk,
    mutateAsync: (args: {
      memberId: number
      moduleId: number
      sessionId?: number | null
    }) =>
      bulk
        .mutateAsync({
          marks: [{ memberId: args.memberId, moduleId: args.moduleId }],
          sessionId: args.sessionId ?? null,
        })
        .then((rows) => rows[0]),
  }
}

export function useUnmarkModuleComplete() {
  const bulk = useUnmarkModulesBulk()
  return {
    ...bulk,
    mutateAsync: (args: { memberId: number; moduleId: number }) =>
      bulk
        .mutateAsync({
          marks: [{ memberId: args.memberId, moduleId: args.moduleId }],
        })
        .then(() => undefined),
  }
}

export function useAdvanceMemberLevel() {
  const bulk = useAdvanceMembersBulk()
  return {
    ...bulk,
    mutateAsync: (args: {
      memberId: number
      notes?: string | null
      // accepted for signature compatibility; bulk RPC computes the next level
      expectedLevelId?: number | null
    }) =>
      bulk
        .mutateAsync({ memberIds: [args.memberId], notes: args.notes ?? null })
        .then((rows) => {
          const row = rows[0]
          if (!row?.ok) throw new Error(row?.message ?? "Promotion failed")
          return {
            newLevelName: row.newLevelName,
          }
        }),
  }
}

// Legacy alias kept for any callers still importing it.
export function useSubmitProgression() {
  const advance = useAdvanceMemberLevel()
  return {
    ...advance,
    mutateAsync: async (args: {
      memberId: number
      toLevelId?: number
      badgeComplete: boolean
      notes: string
    }) => {
      void args.toLevelId
      void args.badgeComplete
      return advance.mutateAsync({ memberId: args.memberId, notes: args.notes })
    },
  }
}

// ============================================================
// 7. ROSTER + MILESTONE-PICKER + MY-PROMOTIONS + DASHBOARD
//    (originally in your file, kept here so nothing regresses)
// ============================================================

export type RosterRow = {
  programmeId: number
  programmeName: string
  memberId: number
  fullName: string
  age: number
  currentLevelId: number | null
  currentLevelName: string | null
  nextLevelId: number | null
  nextLevelName: string | null
  hasMedicalNotes: boolean
  attendanceRate30d: number | null
  sessionsMarked30d: number
  consecutiveAbsences: number
  milestonesDone: number
  milestonesTotal: number
  readyToAdvance: boolean
}

const mapRosterRow = (r: any): RosterRow => ({
  programmeId: r.programme_id,
  programmeName: r.programme_name,
  memberId: r.member_id,
  fullName: r.full_name,
  age: r.age,
  currentLevelId: r.current_level_id ?? null,
  currentLevelName: r.current_level_name ?? null,
  nextLevelId: r.next_level_id ?? null,
  nextLevelName: r.next_level_name ?? null,
  hasMedicalNotes: !!r.has_medical_notes,
  attendanceRate30d: r.attendance_rate_30d ?? null,
  sessionsMarked30d: r.sessions_marked_30d ?? 0,
  consecutiveAbsences: r.consecutive_absences ?? 0,
  milestonesDone: r.milestones_done ?? 0,
  milestonesTotal: r.milestones_total ?? 0,
  readyToAdvance: !!r.ready_to_advance,
})

export function useCoachRoster() {
  return useQuery({
    queryKey: ["coach-roster"],
    queryFn: async (): Promise<RosterRow[]> => {
      const { data, error } = await createClient().rpc("coach_get_roster")
      if (error) throw new Error(error.message)
      return (data ?? []).map(mapRosterRow)
    },
    staleTime: 60_000,
  })
}

export type MilestonePickerStudent = {
  memberId: number
  fullName: string
  attendanceStatus: string | null
  levelMatches: boolean
  completed: boolean
  completedOn: string | null
}

const mapPickerStudent = (s: any): MilestonePickerStudent => ({
  memberId: s.member_id,
  fullName: s.full_name,
  attendanceStatus: s.attendance_status ?? null,
  levelMatches: !!s.level_matches,
  completed: !!s.completed,
  completedOn: s.completed_on ?? null,
})

export function useMilestonePickerStudents(
  sessionId: number | null,
  moduleId: number | null
) {
  return useQuery({
    queryKey: ["milestone-picker", sessionId, moduleId],
    queryFn: async (): Promise<MilestonePickerStudent[]> => {
      const { data, error } = await createClient().rpc(
        "coach_get_module_students",
        {
          p_session_id: sessionId,
          p_module_id: moduleId,
        }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map(mapPickerStudent)
    },
    enabled:
      sessionId !== null && moduleId !== null && sessionId > 0 && moduleId > 0,
    staleTime: 15_000,
  })
}

export function useMyPromotions(limit = 20) {
  return useQuery({
    queryKey: ["my-promotions", limit],
    queryFn: async () => {
      const { data, error } = await createClient().rpc(
        "coach_get_my_promotions",
        {
          p_limit: limit,
        }
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    staleTime: 60_000,
  })
}

export function useMarkModuleCompleteBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: {
      memberIds: number[]
      moduleId: number
      sessionId?: number | null
    }): Promise<
      {
        memberId: number
        alreadyCompleted: boolean
        levelNowComplete: boolean
      }[]
    > => {
      const { data, error } = await createClient().rpc(
        "coach_mark_module_complete_batch",
        {
          p_member_ids: args.memberIds,
          p_module_id: args.moduleId,
          p_session_id: args.sessionId ?? null,
        }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map((r: any) => ({
        memberId: r.member_id,
        alreadyCompleted: !!r.already_completed,
        levelNowComplete: !!r.level_now_complete,
      }))
    },
    onSuccess: (_data, args) => {
      args.memberIds.forEach((id) =>
        qc.invalidateQueries({ queryKey: ["member-progress", id] })
      )
      qc.invalidateQueries({ queryKey: ["coach-roster"] })
      qc.invalidateQueries({ queryKey: ["progression-board"] })
      qc.invalidateQueries({ queryKey: ["progression-summary"] })
      qc.invalidateQueries({ queryKey: ["module-matrix"] })
      qc.invalidateQueries({ queryKey: ["milestone-picker"] })
      qc.invalidateQueries({ queryKey: ["progress-activity"] })
    },
  })
}

// ============================================================
// 8. STUDENT PROGRESS (per-member JSON) — used by the drawer
// ============================================================

export type Milestone = {
  moduleId: number
  name: string
  category: string | null
  description: string | null
  completed: boolean
  completedAt: string | null
  verifiedBy: string | null
  sessionDate: string | null
  notes: string | null
}

export type LevelHistory = {
  id: number
  date: string
  fromLevel: string | null
  toLevel: string | null
  coachName: string | null
  badgeComplete: boolean
  notes: string | null
}

export type StudentProgress = {
  member: {
    id: number
    fullName: string
    gender: string | null
    age: number
    archived: boolean
    hasMedicalNotes: boolean
    hasEmergencyContact: boolean
  }
  programmes: { programmeId: number; name: string; status: string }[]
  level: {
    id: number
    name: string
    goal: string | null
    focusSummary: string | null
    upgradeCriteria: string | null
  } | null
  nextLevel: { id: number; name: string; goal: string | null } | null
  milestonesTotal: number
  milestonesDone: number
  ready: boolean
  canAdvance: boolean
  blockers: string[]
  milestones: Milestone[]
  attendance: {
    rate30d: number | null
    marked30d: number
    present: number
    late: number
    absent: number
    excused: number
    absencesInARow: number
  }
  recentSessions: {
    sessionId: number
    programmeName: string
    sessionDate: string
    attendanceStatus: string | null
    notesPresent: boolean
  }[]
  history: LevelHistory[]
  nextLevelProgrammes: {
    id: number
    name: string
    venueName: string | null
    spotsLeft: number | null
    eligible: boolean
  }[]
}

const mapMilestone = (m: any): Milestone => ({
  moduleId: m.module_id,
  name: m.name,
  category: m.category ?? null,
  description: m.description ?? null,
  completed: !!m.completed,
  completedAt: m.completed_at ?? null,
  verifiedBy: m.verified_by ?? null,
  sessionDate: m.session_date ?? null,
  notes: m.notes ?? null,
})

const mapProgress = (r: any): StudentProgress => ({
  member: {
    id: r.member.id,
    fullName: r.member.full_name,
    gender: r.member.gender ?? null,
    age: r.member.age,
    archived: !!r.member.archived,
    hasMedicalNotes: !!r.member.has_medical_notes,
    hasEmergencyContact: !!r.member.has_emergency_contact,
  },
  programmes: (r.programmes ?? []).map((p: any) => ({
    programmeId: p.programme_id,
    name: p.name,
    status: p.status,
  })),
  level: r.level
    ? {
        id: r.level.id,
        name: r.level.name,
        goal: r.level.goal ?? null,
        focusSummary: r.level.focus_summary ?? null,
        upgradeCriteria: r.level.upgrade_criteria ?? null,
      }
    : null,
  nextLevel: r.next_level
    ? {
        id: r.next_level.id,
        name: r.next_level.name,
        goal: r.next_level.goal ?? null,
      }
    : null,
  milestonesTotal: r.milestones_total ?? 0,
  milestonesDone: r.milestones_done ?? 0,
  ready: !!r.ready,
  canAdvance: !!r.can_advance,
  blockers: r.blockers ?? [],
  milestones: (r.milestones ?? []).map(mapMilestone),
  attendance: {
    rate30d: r.attendance?.rate_30d ?? null,
    marked30d: r.attendance?.marked_30d ?? 0,
    present: r.attendance?.present ?? 0,
    late: r.attendance?.late ?? 0,
    absent: r.attendance?.absent ?? 0,
    excused: r.attendance?.excused ?? 0,
    absencesInARow: r.attendance?.absences_in_a_row ?? 0,
  },
  recentSessions: (r.recent_sessions ?? []).map((s: any) => ({
    sessionId: s.session_id,
    programmeName: s.programme_name,
    sessionDate: s.session_date,
    attendanceStatus: s.attendance_status ?? null,
    notesPresent: !!s.notes_present,
  })),
  history: (r.history ?? []).map((h: any) => ({
    id: h.id,
    date: h.date,
    fromLevel: h.from_level ?? null,
    toLevel: h.to_level ?? null,
    coachName: h.coach_name ?? null,
    badgeComplete: !!h.badge_complete,
    notes: h.notes ?? null,
  })),
  nextLevelProgrammes: (r.next_level_programmes ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    venueName: p.venue_name ?? null,
    spotsLeft: p.spots_left ?? null,
    eligible: !!p.eligible,
  })),
})

export function useGetMemberProgress(memberId: number | null) {
  return useQuery({
    queryKey: ["member-progress", memberId],
    queryFn: async (): Promise<StudentProgress> => {
      const { data, error } = await createClient().rpc(
        "coach_get_student_progress",
        {
          p_member_id: memberId,
        }
      )
      if (error) throw new Error(error.message)
      return mapProgress(data)
    },
    enabled: memberId !== null && Number.isInteger(memberId) && memberId > 0,
    staleTime: 30_000,
  })
}

export function useGetMemberLevelHistory(memberId: number | null) {
  const { data, ...rest } = useGetMemberProgress(memberId)
  return { data: data?.history ?? [], ...rest }
}

export function useGetCurriculumModules(memberId: number | null) {
  const { data, ...rest } = useGetMemberProgress(memberId)
  return { data: data?.milestones ?? [], ...rest }
}
