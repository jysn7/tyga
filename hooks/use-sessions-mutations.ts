import { createClient } from "@supabase/supabase-js"

export function useSessionMutations() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const markAttendance = async (
    sessionId: number,
    memberId: number,
    status: "present" | "absent" | "late"
  ) => {
    const { error } = await supabase.rpc("coach_mark_attendance", {
      p_session_id: sessionId,
      p_member_id: memberId,
      p_status: status,
    })
    if (error) throw new Error(error.message)
  }

  const bulkMarkPresent = async (sessionId: number) => {
    const { error } = await supabase.rpc("coach_bulk_mark_attendance", {
      p_session_id: sessionId,
      p_status: "present",
    })
    if (error) throw new Error(error.message)
  }

  const saveNotes = async (sessionId: number, notes: string) => {
    const { error } = await supabase.rpc("coach_save_session_notes", {
      p_session_id: sessionId,
      p_notes: notes,
    })
    if (error) throw new Error(error.message)
  }

  return { markAttendance, bulkMarkPresent, saveNotes }
}
