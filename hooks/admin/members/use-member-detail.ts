import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
    programme_id: number
    programme_name: string
    venue_name: string | null
    joined_at: string
  }[]
  progressions: {
    id: number
    level_id: number
    badge_complete: boolean
    notes: string | null
    created_at: string
  }[]
  attendance_summary: {
    total: number
    present: number
    absent: number
    late: number
    excused: number
  }
  sensitive_access_history: {
    id: number
    field: string
    reason: string | null
    accessed_at: string
    user_name: string | null
    user_email: string | null
  }[]
}

const SENSITIVE_FIELDS = ["medical_notes", "dob", "emergency_contact"] as const

// Log sensitive access — must be called before useMemberDetail is enabled
export function useLogSensitiveAccess() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      memberId,
      reason,
    }: {
      memberId: number
      reason: string
    }) => {
      const { error } = await supabase.rpc("admin_log_sensitive_access", {
        p_member_id: memberId,
        p_fields: SENSITIVE_FIELDS as unknown as string[],
        p_reason: reason,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_, { memberId }) => {
      // Invalidate so the audit trail picks up the new entry
      queryClient.invalidateQueries({
        queryKey: ["admin-member-detail", memberId],
      })
    },
  })
}

// Only fetch when `enabled` is true (i.e. after logging)
export function useMemberDetail(memberId: number, enabled: boolean) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["admin-member-detail", memberId],
    enabled: enabled && Number.isFinite(memberId) && memberId > 0,
    queryFn: async (): Promise<MemberDetail> => {
      const { data, error } = await supabase.rpc("admin_get_member_detail", {
        p_member_id: memberId,
      })
      if (error) throw new Error(error.message)
      return data as MemberDetail
    },
    staleTime: 30_000,
  })
}
