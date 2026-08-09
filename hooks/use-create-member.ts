import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { Member } from "@/lib/types"
import {
  toCreateMemberInput,
  toQuestionnaireInput,
  type MemberFormValues,
} from "@/lib/validations/member"

async function createMember(values: MemberFormValues): Promise<Member> {
  const supabase = createClient()
  const memberInput = toCreateMemberInput(values)

  // create_member returns int (a bare id), not a row — .single<Member>() was wrong here
  const { data: memberId, error: memberError } = await supabase.rpc(
    "create_member",
    {
      p_full_name: memberInput.full_name,
      p_dob: memberInput.dob,
      p_gender: memberInput.gender,
      p_medical_notes: memberInput.medical_notes,
      p_emergency_contact: memberInput.emergency_contact,
      p_current_level_id: null,
    }
  )
  if (memberError) throw memberError

  const questionnaireInput = toQuestionnaireInput(values)

  const { error: questionnaireError } = await supabase.rpc(
    "submit_member_questionnaire",
    {
      p_member_id: memberId,
      p_availability: JSON.stringify(questionnaireInput.availability),
      p_self_reported_skill_level: questionnaireInput.self_reported_skill_level,
      p_interests: JSON.stringify(questionnaireInput.interests),
      p_gear_owned: JSON.stringify(questionnaireInput.gear_owned),
    }
  )
  if (questionnaireError) throw questionnaireError

  // get_member DOES return `members` (a full row), so .single() is correct here
  const { data: member, error: getMemberError } = await supabase
    .rpc("get_member", { p_member_id: memberId })
    .single<Member>()
  if (getMemberError) throw getMemberError

  return member
}

export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] })
    },
  })
}
