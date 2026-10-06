import { z } from "zod"
import type { Member, MemberQuestionnaire } from "@/lib/types"
import { ageInYears } from "../functions/age"

const MEMBER_GENDER_OPTIONS = ["male", "female", "any"] as const
type MemberGender = (typeof MEMBER_GENDER_OPTIONS)[number]

const SKILL_LEVEL_OPTIONS = [
  "never_played",
  "beginner",
  "some_experience",
  "competitive",
] as const

export const CONSENT_TYPES = [
  "membership",
  "medical_emergency",
  "photo_video",
  "transport",
  "indemnity",
  "code_of_conduct",
] as const

const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine((val) => /^\+?[\d\s-]{7,15}$/.test(val), {
    message: "Enter a valid phone number",
  })

const nameSchema = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .max(100, `${label} must be under 100 characters`)
    .refine((val) => /^[a-zA-Z\s'-]+$/.test(val), {
      message: `${label} can only contain letters, spaces, hyphens, and apostrophes`,
    })

// =====================================================
// CREATE MEMBER FORM
// =====================================================

export const memberFormSchema = z.object({
  // Child Information
  fullName: nameSchema("Full name"),

  dob: z
    .date({ required_error: "Date of birth is required" })
    .refine((d) => d <= new Date(), {
      message: "Date of birth cannot be in the future",
    })
    .refine((d) => ageInYears(d) >= 6, {
      message: "Member must be at least 6 years old",
    })
    .refine((d) => ageInYears(d) <= 22, {
      message: "Member must be 22 or younger",
    }),

  gender: z.enum(MEMBER_GENDER_OPTIONS, {
    required_error: "Please select a gender",
  }),

  schoolName: z.string().max(150).optional(),
  schoolGrade: z.string().max(20).optional(),

  // Golf & Medical
  medicalNotes: z
    .string()
    .max(2000, "Please keep medical notes under 2000 characters")
    .optional(),

  kitSizeTop: z.string().max(20).optional(),
  shoeSize: z.string().max(10).optional(),

  // Questionnaire
  skillLevel: z.enum(SKILL_LEVEL_OPTIONS).nullable().optional(),

  availability: z.string().max(300).optional(),
  interests: z.string().max(300).optional(),
  gearOwned: z.string().max(300).optional(),

  // Consents
  consents: z.object({
    membership: z.boolean().refine((v) => v === true, {
      message: "Membership consent is required",
    }),

    medicalEmergency: z.boolean().refine((v) => v === true, {
      message: "Medical emergency consent is required",
    }),

    photoVideo: z.boolean().optional(),

    transport: z.boolean().optional(),

    indemnity: z.boolean().refine((v) => v === true, {
      message: "Indemnity form must be accepted",
    }),

    codeOfConduct: z.boolean().refine((v) => v === true, {
      message: "Code of conduct must be accepted",
    }),
  }),
})

export type MemberFormValues = z.infer<typeof memberFormSchema>

// =====================================================
// STEPS
// =====================================================

export const STEPS = ["Child information", "Golf & medical", "Consent"] as const

export const STEP_FIELDS: Record<number, (keyof MemberFormValues)[]> = {
  0: ["fullName", "dob"],
  1: [],
  2: ["consents"],
}

// =====================================================
// CREATE MEMBER RPC
// =====================================================

export type CreateMemberInput = Pick<
  Member,
  | "full_name"
  | "dob"
  | "gender"
  | "medical_notes"
  | "school_name"
  | "school_grade"
  | "kit_size_top"
  | "shoe_size"
>

export function toCreateMemberInput(
  values: MemberFormValues
): CreateMemberInput {
  return {
    full_name: values.fullName,
    dob: values.dob.toISOString().split("T")[0],
    gender: values.gender as MemberGender,
    medical_notes: values.medicalNotes || null,
    school_name: values.schoolName || null,
    school_grade: values.schoolGrade || null,
    kit_size_top: values.kitSizeTop || null,
    shoe_size: values.shoeSize || null,
  }
}

// =====================================================
// QUESTIONNAIRE
// =====================================================

export type CreateQuestionnaireInput = Pick<
  MemberQuestionnaire,
  "availability" | "self_reported_skill_level" | "interests" | "gear_owned"
>

export function toQuestionnaireInput(
  values: MemberFormValues
): CreateQuestionnaireInput {
  return {
    availability: { availability: values.availability },
    self_reported_skill_level: values.skillLevel ?? null,
    interests: { interests: values.interests },
    gear_owned: { gear_owned: values.gearOwned },
  }
}
// =====================================================
// CONSENTS
// =====================================================

export type ConsentInput = {
  consent_type: (typeof CONSENT_TYPES)[number]
  signed: boolean
  document_url: string | null
}

export function toConsentsInput(values: MemberFormValues): ConsentInput[] {
  return [
    {
      consent_type: "membership",
      signed: values.consents.membership,
      document_url: null,
    },
    {
      consent_type: "medical_emergency",
      signed: values.consents.medicalEmergency,
      document_url: null,
    },
    {
      consent_type: "photo_video",
      signed: values.consents.photoVideo ?? false,
      document_url: null,
    },
    {
      consent_type: "transport",
      signed: values.consents.transport ?? false,
      document_url: null,
    },
    {
      consent_type: "indemnity",
      signed: values.consents.indemnity,
      document_url: null,
    },
    {
      consent_type: "code_of_conduct",
      signed: values.consents.codeOfConduct,
      document_url: null,
    },
  ]
}

// =====================================================
// EDIT MEMBER
// =====================================================

export const memberEditSchema = z.object({
  fullName: nameSchema("Full name"),

  dob: z
    .date({ required_error: "Date of birth is required" })
    .refine((d) => d <= new Date(), {
      message: "Date of birth cannot be in the future",
    })
    .refine((d) => d >= new Date(1990, 0, 1), {
      message: "Please check the date of birth",
    }),

  gender: z.enum(MEMBER_GENDER_OPTIONS, {
    required_error: "Please select a gender",
  }),

  medicalNotes: z.string().max(2000).optional(),
  medicalAidDetails: z.string().max(200).optional(),
  doctorContact: z.string().max(200).optional(),

  emergencyContactName: nameSchema("Emergency contact name"),

  emergencyContactRelationship: z
    .string()
    .min(1, "Relationship to member is required")
    .max(50),

  emergencyContactPhone: phoneSchema,

  schoolName: z.string().max(150).optional(),
  schoolGrade: z.string().max(20).optional(),

  previousClub: z.string().max(150).optional(),

  kitSizeTop: z.string().max(20).optional(),
  kitSizeBottom: z.string().max(20).optional(),
  shoeSize: z.string().max(10).optional(),
})

export type MemberEditValues = z.infer<typeof memberEditSchema>

export function toUpdateMemberInput(
  values: MemberEditValues,
  memberId: number
) {
  return {
    p_member_id: memberId,
    p_full_name: values.fullName,
    p_dob: values.dob.toISOString().split("T")[0],
    p_gender: values.gender,
    p_medical_notes: values.medicalNotes || null,

    p_emergency_contact_name: values.emergencyContactName,
    p_emergency_contact_relationship: values.emergencyContactRelationship,
    p_emergency_contact_phone: values.emergencyContactPhone,

    p_current_level_id: null,

    p_school_name: values.schoolName || null,
    p_school_grade: values.schoolGrade || null,

    p_kit_size_top: values.kitSizeTop || null,
    p_kit_size_bottom: values.kitSizeBottom || null,
    p_shoe_size: values.shoeSize || null,

    p_previous_club: values.previousClub || null,
    p_medical_aid_details: values.medicalAidDetails || null,
    p_doctor_contact: values.doctorContact || null,
  }
}

// =====================================================
// ONBOARDING STATUS
// =====================================================

export type OnboardingStatus = {
  member: Member
  questionnaire: MemberQuestionnaire | null
  consents: {
    id: number
    account_id: string
    member_id: number
    consent_type: string
    signed: boolean
    signed_at: string | null
    document_url: string | null
  }[]
  documents: {
    id: number
    account_id: string | null
    member_id: number | null
    doc_type: string
    file_url: string
    uploaded_at: string
  }[]
}

export function isOnboardingComplete(status: OnboardingStatus): boolean {
  const memberComplete =
    !!status.member.full_name && !!status.member.dob && !!status.member.gender

  const questionnaireComplete = !!status.questionnaire?.submitted_at

  const requiredConsents = [
    "membership",
    "medical_emergency",
    "indemnity",
    "code_of_conduct",
  ]

  const consentsComplete = requiredConsents.every((type) =>
    status.consents.some((c) => c.consent_type === type && c.signed === true)
  )

  return memberComplete && questionnaireComplete && consentsComplete
}
