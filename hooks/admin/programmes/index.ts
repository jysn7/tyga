// Queries
export {
  useProgrammes,
  useProgramme,
  useVenues,
  useLevels,
  useGetProgrammeCoaches,
  useGetSessions,
  useGetSessionModules,
  type AdminProgramme,
  type ProgrammeType,
  type UseProgrammesFilters,
  type ProgrammeCoach,
  type Session,
  type SessionModule,
} from "./use-programmes"

// Programme Mutations
export {
  useCreateProgramme,
  useUpdateProgramme,
  useToggleProgrammeArchive,
  useDeleteProgramme,
  type ProgrammeInput,
} from "./use-programme-mutations"

// Programme Coach Mutations
export {
  useAssignCoachToProgramme,
  useRemoveCoachFromProgramme,
} from "./use-programme-coaches"

// Session Mutations
export {
  useGenerateSessions,
  useUpdateSession,
  useDeleteSession,
  useAddCoachToSession,
  useRemoveCoachFromSession,
  useSyncSessionCoaches,
} from "./use-session-mutations"

// Curriculum Mutations
export {
  useTagSessionCurriculum,
  useRemoveModuleFromSession,
} from "./use-curriculum-mutations"
