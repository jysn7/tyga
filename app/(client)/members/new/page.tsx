"use client"

import { Check, ChevronLeft, Loader2 } from "lucide-react"
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
import { StepConsent } from "@/components/portals/client/members/newMembers/step-consent"

function NewMemberFormContent() {
  const router = useRouter()
  const { step, isLastStep, next, back } = useStepContext()
  const { handleSubmit } = useMemberForm()
  const { mutateAsync, isPending } = useCreateMember()

  const onSubmit = async (values: MemberFormValues) => {
    const toastId = "create-member-status"

    toast.add({
      id: toastId,
      title: "Creating member…",
      description: "Saving member information and consent.",
      type: "loading",
      timeout: 0,
    })

    try {
      await mutateAsync(values)

      toast.add({
        id: toastId,
        title: "Member added",
        description: `${values.fullName} has been added successfully.`,
        type: "success",
        timeout: 5000,
      })

      router.push("/members")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create member"

      toast.add({
        id: toastId,
        title: "Couldn't add member",
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
    <div className="max-w-8xl mx-auto flex flex-col gap-8 rounded-lg bg-card px-4 py-8 shadow sm:px-6 sm:py-12">
      {/* Stepper */}
      <div className="flex items-center">
        {STEPS.map((label, i) => {
          const isComplete = i < step
          const isCurrent = i === step
          return (
            <div
              key={label}
              className="flex flex-1 items-center last:flex-none"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    isComplete || isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`hidden text-xs font-medium transition-colors sm:inline ${
                    isCurrent || isComplete
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-3 h-px flex-1 transition-colors ${
                    isComplete ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div>
        {step === 0 && <StepBasicInfo />}
        {step === 1 && <StepHealthSafety />}
        {step === 2 && <StepConsent />}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/60 pt-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={isPending}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {step === 0 ? "Cancel" : "Back"}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={handleNext}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              {isLastStep ? "Adding…" : "Saving…"}
            </>
          ) : isLastStep ? (
            "Add member"
          ) : (
            "Next"
          )}
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
