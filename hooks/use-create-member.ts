import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { Member } from "@/lib/types"
import {
  toCreateMemberInput,
  toQuestionnaireInput,
  toConsentsInput,
  type MemberFormValues,
} from "@/lib/validations/member"

async function createMember(values: MemberFormValues): Promise<Member> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be signed in to add a member")
  }

  // =====================================================
  // 1. Create member
  // =====================================================

  const memberInput = toCreateMemberInput(values)

  const { data: memberId, error: memberError } = await supabase.rpc(
    "create_member",
    {
      p_full_name: memberInput.full_name,
      p_dob: memberInput.dob,
      p_school_name: memberInput.school_name,
      p_school_grade: memberInput.school_grade,
      p_shoe_size: memberInput.shoe_size,
      p_kit_size_top: memberInput.kit_size_top,
      p_medical_notes: memberInput.medical_notes,
      p_gender: memberInput.gender ?? null,
    }
  )

  if (memberError) {
    throw new Error(memberError.message)
  }

  if (memberId == null) {
    throw new Error("Failed to create member")
  }

  const stepErrors: string[] = []

  // =====================================================
  // 2. Questionnaire
  // =====================================================

  const questionnaireInput = toQuestionnaireInput(values)

  const { error: questionnaireError } = await supabase.rpc(
    "submit_member_questionnaire",
    {
      p_member_id: memberId,
      p_availability: questionnaireInput.availability,
      p_self_reported_skill_level: questionnaireInput.self_reported_skill_level,
      p_interests: questionnaireInput.interests,
      p_gear_owned: questionnaireInput.gear_owned,
    }
  )

  if (questionnaireError) {
    stepErrors.push(`Questionnaire: ${questionnaireError.message}`)
  }

  // =====================================================
  // 3. Consents
  // =====================================================

  const consentsInput = toConsentsInput(values)

  const { error: consentsError } = await supabase.rpc(
    "submit_member_consents",
    {
      p_member_id: memberId,
      p_consents: consentsInput,
    }
  )

  if (consentsError) {
    stepErrors.push(`Consents: ${consentsError.message}`)
  }

  // =====================================================
  // 4. Fetch created member
  // =====================================================

  const { data: member, error: getMemberError } = await supabase
    .rpc("get_my_members_with_details", {
      p_member_id: memberId,
    })
    .single<Member>()

  if (getMemberError) {
    throw new Error(getMemberError.message)
  }

  if (stepErrors.length > 0) {
    throw new Error(
      `Member created, but some steps failed: ${stepErrors.join(
        "; "
      )}. You can finish these from the member's profile.`
    )
  }

  return member
}

export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members"],
      })
    },
  })
}
