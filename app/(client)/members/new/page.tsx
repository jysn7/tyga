"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { STEPS, type MemberFormValues } from "@/lib/validations/member"
import {
  NewMemberFormProvider,
  useMemberForm,
  useStepContext,
} from "@/context/new-member-form-context"
import { useCreateMember } from "@/hooks/use-create-member"
import { StepBasicInfo } from "@/components/portals/client/members/newMembers/step-basic-info"
import { StepHealthSafety } from "@/components/portals/client/members/newMembers/step-health-safety"
import { StepAboutGolfer } from "@/components/portals/client/members/newMembers/step-about-golfer"
import { StepConsent } from "@/components/portals/client/members/newMembers/step-consent"
import { StepDocuments } from "@/components/portals/client/members/newMembers/step-documents"

function NewMemberFormContent() {
  const router = useRouter()
  const { step, isLastStep, next, back } = useStepContext()
  const { handleSubmit } = useMemberForm()
  const { mutateAsync, isPending } = useCreateMember()

  const onSubmit = async (values: MemberFormValues) => {
    const toastId = "create-member-status"

    toast.add({
      id: toastId,
      title: "Creating member...",
      description: "Uploading documents and saving consent — please wait",
      type: "loading",
      timeout: 0,
    })

    try {
      await mutateAsync(values)

      toast.add({
        id: toastId,
        title: "Member added! 🎉",
        description: `${values.fullName} has been added successfully.`,
        type: "success",
        timeout: 5000,
      })

      setTimeout(() => router.push("/members"), 1500)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create member"

      toast.add({
        id: toastId,
        title: "Error",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleNext() {
    if (isLastStep) {
      await handleSubmit(onSubmit)()
      return
    }
    await next()
  }

  function handleBack() {
    if (step === 0) {
      router.push("/members")
      return
    }
    back()
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col px-6 py-10">
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-2">
            <div
              className={`h-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
            <span
              className={`text-xs transition-colors ${
                i === step ? "text-foreground" : "text-muted-foreground/60"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1">
        {step === 0 && <StepBasicInfo />}
        {step === 1 && <StepHealthSafety />}
        {step === 2 && <StepAboutGolfer />}
        {step === 3 && <StepConsent />}
        {step === 4 && <StepDocuments />}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-5">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <Button
          size="sm"
          variant="secondary"

          disabled={isPending}
          onClick={handleNext}
        >
          {isPending ? "Saving…" : isLastStep ? "Add member" : "Next"}
        </Button>
      </div>
    </div>
  )
}

export default function NewMemberPage() {
  return (
    <NewMemberFormProvider>
      <NewMemberFormContent />
    </NewMemberFormProvider>
  )
}
