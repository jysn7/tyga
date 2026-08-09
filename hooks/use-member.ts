import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type MemberDetail = {
  id: string
  fullName: string
  dob: string
  gender: "male" | "female" | "any"
  medicalNotes: string | null
  emergencyContact: string | null
  currentLevelName: string | null
  nextSessionLabel: string | null
  activeEnrollmentCount: number
}

type MemberWithDetailsRow = {
  id: number
  full_name: string
  dob: string
  gender: "male" | "female" | "any"
  medical_notes: string | null
  emergency_contact: string | null
  current_level_name: string | null
  next_session_label: string | null
  active_enrollment_count: number
}

function toMemberDetail(row: MemberWithDetailsRow): MemberDetail {
  return {
    id: String(row.id),
    fullName: row.full_name,
    dob: row.dob,
    gender: row.gender,
    medicalNotes: row.medical_notes,
    emergencyContact: row.emergency_contact,
    currentLevelName: row.current_level_name,
    nextSessionLabel: row.next_session_label,
    activeEnrollmentCount: row.active_enrollment_count,
  }
}

export function useMember(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["members", id],
    queryFn: async (): Promise<MemberDetail> => {
      const { data, error } = await supabase
        .rpc("get_my_members_with_details", { p_member_id: Number(id) })
        .single<MemberWithDetailsRow>()

      if (error) throw error
      return toMemberDetail(data)
    },
    enabled: !!id,
  })
}
