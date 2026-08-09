import { z } from "zod"
import type { Member, MemberQuestionnaire } from "@/lib/types"

// Member.gender is "male" | "female" | "any", but "any" doesn't apply to
// an individual person — that value is only meaningful on Programme.gender_restriction.
const MEMBER_GENDER_OPTIONS = ["male", "female"] as const
type MemberGender = (typeof MEMBER_GENDER_OPTIONS)[number]

// self_reported_skill_level is just `string | null` at the DB/type level
// (no enum enforced there) — constraining it here is a UI-level decision.
const SKILL_LEVEL_OPTIONS = [
  "never_played",
  "beginner",
  "some_experience",
  "competitive",
] as const

export const memberFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dob: z
    .date({ required_error: "Date of birth is required" })
    .refine((d) => d <= new Date(), {
      message: "Date of birth cannot be in the future",
    }),
  gender: z.enum(MEMBER_GENDER_OPTIONS, {
    required_error: "Please select a gender",
  }),
  medicalNotes: z.string().optional(),
  emergencyContact: z.string().optional(),
  skillLevel: z.enum(SKILL_LEVEL_OPTIONS, {
    required_error: "Please select a skill level",
  }),
  availability: z.string().optional(),
  interests: z.string().optional(),
  gearOwned: z.string().optional(),
})

export type MemberFormValues = z.infer<typeof memberFormSchema>

export const STEPS = [
  "Basic info",
  "Health & safety",
  "About your golfer",
] as const

export const STEP_FIELDS: Record<number, (keyof MemberFormValues)[]> = {
  0: ["fullName", "dob", "gender"],
  1: [],
  2: ["skillLevel"],
}

// Shape the create_member RPC actually expects, built from your Member type
// (id/account_id/current_level_id/created_at are server-assigned, so omitted)
export type CreateMemberInput = Pick<
  Member,
  "full_name" | "dob" | "gender" | "medical_notes" | "emergency_contact"
>

export function toCreateMemberInput(
  values: MemberFormValues
): CreateMemberInput {
  return {
    full_name: values.fullName,
    dob: values.dob.toISOString().split("T")[0],
    gender: values.gender as MemberGender,
    medical_notes: values.medicalNotes || null,
    emergency_contact: values.emergencyContact || null,
  }
}

// Shape the submit_member_questionnaire RPC expects, built from MemberQuestionnaire
export type CreateQuestionnaireInput = Pick<
  MemberQuestionnaire,
  "availability" | "self_reported_skill_level" | "interests" | "gear_owned"
>

export function toQuestionnaireInput(
  values: MemberFormValues
): CreateQuestionnaireInput {
  return {
    availability: { availability: values.availability },
    self_reported_skill_level: values.skillLevel,
    interests: { interests: values.interests },
    gear_owned: { gear_owned: values.gearOwned },
  }
}

// Edit form for an existing member — same fields as creation, minus the
// questionnaire (availability/skillLevel/interests/gear), since those
// aren't part of `update_member` and belong to a separate onboarding step.
export const memberEditSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dob: z
    .date({ required_error: "Date of birth is required" })
    .refine((d) => d <= new Date(), {
      message: "Date of birth cannot be in the future",
    }),
  gender: z.enum(MEMBER_GENDER_OPTIONS, {
    required_error: "Please select a gender",
  }),
  medicalNotes: z.string().optional(),
  emergencyContact: z.string().optional(),
})
export type MemberEditValues = z.infer<typeof memberEditSchema>

export function toUpdateMemberInput(values: MemberEditValues) {
  return {
    p_full_name: values.fullName,
    p_dob: values.dob.toISOString().split("T")[0],
    p_gender: values.gender,
    p_medical_notes: values.medicalNotes || null,
    p_emergency_contact: values.emergencyContact || null,
  }
}
