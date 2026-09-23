"use client"

import { createContext, useContext } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  memberFormSchema,
  STEP_FIELDS,
  STEPS,
  type MemberFormValues,
} from "@/lib/validations/member"
import { useMultiStepForm } from "@/hooks/useMultiStepForm"

type StepContextValue = {
  step: number
  isLastStep: boolean
  next: () => Promise<boolean>
  back: () => void
}

const StepContext = createContext<StepContextValue | null>(null)

export function useStepContext() {
  const ctx = useContext(StepContext)
  if (!ctx) {
    throw new Error("useStepContext must be used within NewMemberFormProvider")
  }
  return ctx
}

// Thin typed wrapper around RHF's context hook
export function useMemberForm() {
  return useFormContext<MemberFormValues>()
}

export function NewMemberFormProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    mode: "onTouched",
    defaultValues: {
      // Basic info
      fullName: "",
      dob: undefined,
      gender: undefined,
      schoolName: "",
      schoolGrade: "",
      idOrBirthCertNumber: "",
      previousClub: "",

      // Health & safety
      medicalNotes: "",
      medicalAidDetails: "",
      doctorContact: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",

      // About golfer
      skillLevel: undefined,
      availability: "",
      interests: "",
      gearOwned: "",
      kitSizeTop: "",
      kitSizeBottom: "",
      shoeSize: "",

      // Consents — must exist as an object so nested fields render correctly
      consents: {
        medicalEmergency: false,
        photoVideo: false,
        transport: false,
        indemnity: false,
        codeOfConduct: false,
      },

      // File fields — left undefined so `instanceof File` validation fires correctly
      birthCertificateFile: undefined,
      idCopyFile: undefined,
      registrationFormFile: undefined,
      proofOfPaymentFile: undefined,
    },
  })

  const { step, isLastStep, next, back } = useMultiStepForm<MemberFormValues>(
    STEPS.length,
    STEP_FIELDS,
    form.trigger
  )

  return (
    <FormProvider {...form}>
      <StepContext.Provider value={{ step, isLastStep, next, back }}>
        {children}
      </StepContext.Provider>
    </FormProvider>
  )
}
