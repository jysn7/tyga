import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { Member } from "@/lib/types"
import {
  toCreateMemberInput,
  toQuestionnaireInput,
  toConsentsInput,
  toDocumentUploads,
  type MemberFormValues,
} from "@/lib/validations/member"

async function uploadDocument(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  memberId: number,
  docType: string,
  file: File
): Promise<string> {
  const path = `${userId}/${memberId}/${docType}-${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file, { upsert: false })
  if (uploadError) {
    throw new Error(`Failed to upload ${docType}: ${uploadError.message}`)
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year
  if (signedError || !signed) {
    throw new Error(`Failed to get URL for ${docType}: ${signedError?.message}`)
  }

  return signed.signedUrl
}

async function createMember(values: MemberFormValues): Promise<Member> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("You must be signed in to add a member")
  }

  // 1. Create the member row
  // create_member returns int (a bare id), not a row — .single<Member>() would be wrong here
  const memberInput = toCreateMemberInput(values)
  const { data: memberId, error: memberError } = await supabase.rpc(
    "create_member",
    {
      p_full_name: memberInput.full_name,
      p_dob: memberInput.dob,
      p_gender: memberInput.gender,
      p_medical_notes: memberInput.medical_notes,
      p_emergency_contact_name: memberInput.emergency_contact_name,
      p_emergency_contact_relationship:
        memberInput.emergency_contact_relationship,
      p_emergency_contact_phone: memberInput.emergency_contact_phone,
      p_current_level_id: null,
      p_school_name: memberInput.school_name,
      p_school_grade: memberInput.school_grade,
      p_id_or_birth_cert_number: memberInput.id_or_birth_cert_number,
      p_kit_size_top: memberInput.kit_size_top,
      p_kit_size_bottom: memberInput.kit_size_bottom,
      p_shoe_size: memberInput.shoe_size,
      p_previous_club: memberInput.previous_club,
      p_medical_aid_details: memberInput.medical_aid_details,
      p_doctor_contact: memberInput.doctor_contact,
    }
  )

  if (memberError) throw new Error(memberError.message)
  if (memberId == null) throw new Error("Failed to create member")

  const stepErrors: string[] = []

  // 2. Submit the questionnaire
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
  if (questionnaireError) {
    stepErrors.push(`Questionnaire: ${questionnaireError.message}`)
  }

  // 3. Upload documents, then register each one
  const uploads = toDocumentUploads(values)
  for (const { doc_type, file } of uploads) {
    try {
      const fileUrl = await uploadDocument(
        supabase,
        user.id,
        memberId,
        doc_type,
        file
      )
      const { error: registerError } = await supabase.rpc(
        "register_member_document",
        {
          p_member_id: memberId,
          p_doc_type: doc_type,
          p_file_url: fileUrl,
        }
      )
      if (registerError) {
        stepErrors.push(`${doc_type}: ${registerError.message}`)
      }
    } catch (err) {
      stepErrors.push(
        err instanceof Error ? err.message : `Failed to upload ${doc_type}`
      )
    }
  }

  // 4. Submit consents
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

  // 5. Fetch the created member row
  // get_member returns a full `members` row, so .single() is correct here
  const { data: member, error: getMemberError } = await supabase
    .rpc("get_member", { p_member_id: memberId })
    .single<Member>()
  if (getMemberError) throw new Error(getMemberError.message)

  if (stepErrors.length > 0) {
    // Member exists but onboarding is incomplete — surface this clearly
    // rather than silently succeeding. The caller can offer to resume
    // via get_member_onboarding_status.
    throw new Error(
      `Member created, but some steps failed: ${stepErrors.join("; ")}. You can finish these from the member's profile.`
    )
  }

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
