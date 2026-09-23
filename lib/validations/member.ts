import { z } from "zod"
import type { Member, MemberQuestionnaire } from "@/lib/types"

// Member.gender is a shared domain type that can legitimately include "any" for
// imported / legacy data; the edit flow must accept it to avoid invalidating
// existing records while still keeping the standard male/female options available.
const MEMBER_GENDER_OPTIONS = ["male", "female", "any"] as const
type MemberGender = (typeof MEMBER_GENDER_OPTIONS)[number]

// self_reported_skill_level is just `string | null` at the DB/type level
// (no enum enforced there) — constraining it here is a UI-level decision.
const SKILL_LEVEL_OPTIONS = [
  "never_played",
  "beginner",
  "some_experience",
  "competitive",
] as const

// Matches the consent_type CHECK constraint on the consents table
export const CONSENT_TYPES = [
  "medical_emergency",
  "photo_video",
  "transport",
  "indemnity",
  "code_of_conduct",
] as const

// Matches the doc_type CHECK constraint on the documents table
export const DOC_TYPES = [
  "birth_certificate",
  "id_copy",
  "registration_form",
  "proof_of_payment",
] as const

// ---------- Shared field-level validators ----------

// SA ID numbers are exactly 13 digits. Birth certificate numbers vary, so we
// only enforce "digits only, 6–13 characters" rather than forcing the strict
// 13-digit ID format — this still blocks garbage like "n/a" or "-" while
// staying usable for kids who only have a birth cert number.
const idOrBirthCertNumberSchema = z
  .string()
  .min(1, "ID or birth certificate number is required")
  .refine((val) => /^\d{6,13}$/.test(val), {
    message: "Must be 6–13 digits (ID number or birth certificate number)",
  })

// Basic phone validation: optional leading +, then 7–15 digits, allowing
// spaces/dashes for readability (e.g. "082 123 4567" or "+27 82 123 4567").
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

// ---------- Form Schema ----------

export const memberFormSchema = z.object({
  // --- Basic info ---
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
  schoolName: z.string().max(150).optional(),
  schoolGrade: z.string().max(20).optional(),
  idOrBirthCertNumber: idOrBirthCertNumberSchema,
  previousClub: z.string().max(150).optional(),

  // --- Health & safety ---
  medicalNotes: z
    .string()
    .max(2000, "Please keep medical notes under 2000 characters")
    .optional(),
  medicalAidDetails: z.string().max(200).optional(),
  doctorContact: z.string().max(200).optional(),
  emergencyContactName: nameSchema("Emergency contact name"),
  emergencyContactRelationship: z
    .string()
    .min(1, "Relationship to member is required")
    .max(50, "Relationship must be under 50 characters"),
  emergencyContactPhone: phoneSchema,

  // --- About golfer ---
  skillLevel: z.enum(SKILL_LEVEL_OPTIONS, {
    required_error: "Please select a skill level",
  }),
  availability: z.string().max(300).optional(),
  interests: z.string().max(300).optional(),
  gearOwned: z.string().max(300).optional(),
  kitSizeTop: z.string().max(20).optional(),
  kitSizeBottom: z.string().max(20).optional(),
  shoeSize: z.string().max(10).optional(),

  // --- Consent & compliance (POPIA) ---
  consents: z.object({
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

  // --- Administrative documents ---
  birthCertificateFile: z
    .instanceof(File, { message: "Birth certificate or ID is required" })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File must be under 10MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "File must be a JPG, PNG, or PDF",
      }
    ),
  idCopyFile: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File must be under 10MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "File must be a JPG, PNG, or PDF",
      }
    )
    .optional(),
  registrationFormFile: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File must be under 10MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "File must be a JPG, PNG, or PDF",
      }
    )
    .optional(),
  proofOfPaymentFile: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File must be under 10MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "File must be a JPG, PNG, or PDF",
      }
    )
    .optional(),
})

export type MemberFormValues = z.infer<typeof memberFormSchema>

export const STEPS = [
  "Basic info",
  "Health & safety",
  "About your golfer",
  "Consent & compliance",
  "Documents",
] as const

// Only required fields are listed here — optional fields never block the
// wizard's Next button. Every field is still validated on final submit
// against memberFormSchema.
export const STEP_FIELDS: Record<number, (keyof MemberFormValues)[]> = {
  0: ["fullName", "dob", "gender", "idOrBirthCertNumber"],
  1: [
    "emergencyContactName",
    "emergencyContactRelationship",
    "emergencyContactPhone",
  ],
  2: ["skillLevel"],
  3: ["consents"],
  4: ["birthCertificateFile"],
}

// ---------- RPC Input Types ----------

// Shape the create_member RPC actually expects, built from your Member type
// (id/account_id/current_level_id/created_at/archived_at are server-assigned, so omitted)
export type CreateMemberInput = Pick<
  Member,
  | "full_name"
  | "dob"
  | "gender"
  | "medical_notes"
  | "emergency_contact_name"
  | "emergency_contact_relationship"
  | "emergency_contact_phone"
  | "school_name"
  | "school_grade"
  | "id_or_birth_cert_number"
  | "kit_size_top"
  | "kit_size_bottom"
  | "shoe_size"
  | "previous_club"
  | "medical_aid_details"
  | "doctor_contact"
>

export function toCreateMemberInput(
  values: MemberFormValues
): CreateMemberInput {
  return {
    full_name: values.fullName,
    dob: values.dob.toISOString().split("T")[0],
    gender: values.gender as MemberGender,
    medical_notes: values.medicalNotes || null,
    emergency_contact_name: values.emergencyContactName,
    emergency_contact_relationship: values.emergencyContactRelationship,
    emergency_contact_phone: values.emergencyContactPhone,
    school_name: values.schoolName || null,
    school_grade: values.schoolGrade || null,
    id_or_birth_cert_number: values.idOrBirthCertNumber,
    kit_size_top: values.kitSizeTop || null,
    kit_size_bottom: values.kitSizeBottom || null,
    shoe_size: values.shoeSize || null,
    previous_club: values.previousClub || null,
    medical_aid_details: values.medicalAidDetails || null,
    doctor_contact: values.doctorContact || null,
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

// Shape the submit_member_consents RPC expects: an array of
// { consent_type, signed, document_url } objects, one per consent type.
// document_url is left null here — it gets filled in only if a signed
// consent form file was uploaded separately (most consents are just checkboxes).
export type ConsentInput = {
  consent_type: (typeof CONSENT_TYPES)[number]
  signed: boolean
  document_url: string | null
}

export function toConsentsInput(values: MemberFormValues): ConsentInput[] {
  return [
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

// One entry per file the parent actually attached. Files are uploaded to
// storage first; register_member_document is then called once per entry
// with the resulting file_url.
export type DocumentUploadInput = {
  doc_type: (typeof DOC_TYPES)[number]
  file: File
}

export function toDocumentUploads(
  values: MemberFormValues
): DocumentUploadInput[] {
  const uploads: DocumentUploadInput[] = [
    { doc_type: "birth_certificate", file: values.birthCertificateFile },
  ]
  if (values.idCopyFile) {
    uploads.push({ doc_type: "id_copy", file: values.idCopyFile })
  }
  if (values.registrationFormFile) {
    uploads.push({
      doc_type: "registration_form",
      file: values.registrationFormFile,
    })
  }
  if (values.proofOfPaymentFile) {
    uploads.push({
      doc_type: "proof_of_payment",
      file: values.proofOfPaymentFile,
    })
  }
  return uploads
}

// ---------- Edit Form (Existing Member) ----------

// Edit form for an existing member — same fields as creation, minus the
// questionnaire, consents, and documents (those aren't part of `update_member`
// and belong to separate onboarding steps / RPCs).
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
  idOrBirthCertNumber: idOrBirthCertNumberSchema,
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
    p_id_or_birth_cert_number: values.idOrBirthCertNumber,
    p_kit_size_top: values.kitSizeTop || null,
    p_kit_size_bottom: values.kitSizeBottom || null,
    p_shoe_size: values.shoeSize || null,
    p_previous_club: values.previousClub || null,
    p_medical_aid_details: values.medicalAidDetails || null,
    p_doctor_contact: values.doctorContact || null,
  }
}

// ---------- Onboarding Status ----------

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

// ---------- Helpers ----------

export function isOnboardingComplete(status: OnboardingStatus): boolean {
  // Check member has all required fields
  const memberComplete =
    !!status.member.full_name && !!status.member.dob && !!status.member.gender

  // Check questionnaire is submitted
  const questionnaireComplete = !!status.questionnaire?.submitted_at

  // Check all required consents are signed
  const requiredConsents = ["medical_emergency", "indemnity", "code_of_conduct"]
  const consentsComplete = requiredConsents.every((type) =>
    status.consents.some((c) => c.consent_type === type && c.signed === true)
  )

  // Check required documents are uploaded
  const documentsComplete = status.documents.some(
    (d) => d.doc_type === "birth_certificate"
  )

  return (
    memberComplete &&
    questionnaireComplete &&
    consentsComplete &&
    documentsComplete
  )
}
