import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { MemberQuestionnaire } from "@/lib/types"

export type MemberDetail = {
  member: {
    id: number
    account_id: string
    full_name: string
    dob: string
    gender: "male" | "female" | "any"
    current_level_id: number | null
    school_name: string | null
    school_grade: string | null
    id_or_birth_cert_number: string | null
    previous_club: string | null
    medical_notes: string | null
    medical_aid_details: string | null
    doctor_contact: string | null
    emergency_contact_name: string | null
    emergency_contact_relationship: string | null
    emergency_contact_phone: string | null
    kit_size_top: string | null
    kit_size_bottom: string | null
    shoe_size: string | null
    onboarding_complete: boolean
    archived_at: string | null
    created_at: string
  }
  account: {
    id: string
    full_name: string | null
    email: string | null
    phone: string | null
    address: string | null
    avatar_url: string | null
  } | null
  level: {
    id: number
    name: string
    goal: string | null
    focus_summary: string | null
  } | null
  questionnaire: MemberQuestionnaire | null
  consents: {
    id: number
    consent_type: string
    signed: boolean
    signed_at: string | null
    document_url: string | null
  }[]
  documents: {
    id: number
    doc_type: string
    file_url: string
    uploaded_at: string
  }[]
  enrollments: {
    id: number
    status: string
    subsidised: boolean | null
    programme_id: number
    programme_name: string
    venue_id: number
    venue_name: string | null
    joined_at: string | null
  }[]
  progressions: {
    id: number
    from_level_id: number
    from_level_name: string | null
    to_level_id: number
    to_level_name: string | null
    date: string
    badge_complete: boolean
    notes: string | null
  }[]
  attendance_summary: {
    total: number
    present: number
    absent: number
    late: number
    excused: number
  }
  recent_attendance: {
    id: number
    status: string
    marked_at: string
    session_date: string
    start_time: string | null
    end_time: string | null
    programme_name: string
    venue_name: string | null
  }[]
}

export function useMemberDetail(memberId: number, enabled = true) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["member-detail", memberId],
    enabled: enabled && Number.isFinite(memberId) && memberId > 0,
    queryFn: async (): Promise<MemberDetail> => {
      const { data, error } = await supabase.rpc("parent_get_member_detail", {
        p_member_id: memberId,
      })
      if (error) throw new Error(error.message)
      return data as MemberDetail
    },
    staleTime: 30_000,
  })
}
