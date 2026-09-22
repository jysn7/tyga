import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type MemberDetail = {
  id: string
  fullName: string
  dob: string
  gender: "male" | "female" | "any"
  schoolName: string | null
  schoolGrade: string | null
  idOrBirthCertNumber: string | null
  kitSizeTop: string | null
  kitSizeBottom: string | null
  shoeSize: string | null
  previousClub: string | null
  medicalNotes: string | null
  medicalAidDetails: string | null
  doctorContact: string | null
  emergencyContactName: string | null
  emergencyContactRelationship: string | null
  emergencyContactPhone: string | null
  currentLevelName: string | null
  nextSessionLabel: string | null
  activeEnrollmentCount: number
  onboardingComplete: boolean
}

export type MemberWithDetailsRow = {
  id: number
  full_name: string
  dob: string
  gender: "male" | "female" | "any"
  school_name: string | null
  school_grade: string | null
  id_or_birth_cert_number: string | null
  kit_size_top: string | null
  kit_size_bottom: string | null
  shoe_size: string | null
  previous_club: string | null
  medical_notes: string | null
  medical_aid_details: string | null
  doctor_contact: string | null
  emergency_contact_name: string | null
  emergency_contact_relationship: string | null
  emergency_contact_phone: string | null
  current_level_name: string | null
  next_session_label: string | null
  active_enrollment_count: number
  onboarding_complete: boolean
}

// Exported so useMembers (the list version) can reuse the exact same
// mapping instead of duplicating it — one conversion, two call sites.
export function toMemberDetail(row: MemberWithDetailsRow): MemberDetail {
  return {
    id: String(row.id),
    fullName: row.full_name,
    dob: row.dob,
    gender: row.gender,
    schoolName: row.school_name,
    schoolGrade: row.school_grade,
    idOrBirthCertNumber: row.id_or_birth_cert_number,
    kitSizeTop: row.kit_size_top,
    kitSizeBottom: row.kit_size_bottom,
    shoeSize: row.shoe_size,
    previousClub: row.previous_club,
    medicalNotes: row.medical_notes,
    medicalAidDetails: row.medical_aid_details,
    doctorContact: row.doctor_contact,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactRelationship: row.emergency_contact_relationship,
    emergencyContactPhone: row.emergency_contact_phone,
    currentLevelName: row.current_level_name,
    nextSessionLabel: row.next_session_label,
    activeEnrollmentCount: row.active_enrollment_count,
    onboardingComplete: row.onboarding_complete,
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

      if (error) throw new Error(error.message)
      return toMemberDetail(data)
    },
    enabled: !!id,
  })
}
