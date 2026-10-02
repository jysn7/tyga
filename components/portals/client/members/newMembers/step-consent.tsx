"use client"

import { useMemberForm } from "@/context/new-member-form-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const CONSENT_ITEMS = [
  {
    name: "consents.membership" as const,
    label: "Membership agreement",
    description:
      "I apply for membership of TYGA and confirm that all information supplied is accurate.",
    required: true,
  },
  {
    name: "consents.medicalEmergency" as const,
    label: "Medical emergency consent",
    description:
      "I authorize TYGA staff to seek emergency medical treatment for my child if I cannot be reached.",
    required: true,
  },
  {
    name: "consents.indemnity" as const,
    label: "Indemnity agreement",
    description:
      "I accept the indemnity agreement and release TYGA from liability as outlined in the membership documentation.",
    required: true,
  },
  {
    name: "consents.codeOfConduct" as const,
    label: "Code of conduct",
    description:
      "My child and I agree to abide by TYGA's code of conduct during all coaching sessions, tournaments and events.",
    required: true,
  },
  {
    name: "consents.photoVideo" as const,
    label: "Photo / video consent",
    description:
      "I consent to my child being photographed or filmed for TYGA promotional and social media purposes.",
    required: false,
  },
  {
    name: "consents.transport" as const,
    label: "Transport consent",
    description:
      "I consent to my child being transported by TYGA staff for approved events when required.",
    required: false,
  },
] as const

export function StepConsent() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useMemberForm()

  const consents = watch("consents")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Consent & compliance</h2>
        <p className="text-sm text-muted-foreground">
          Please review and accept the required agreements before completing
          registration.
        </p>
      </div>

      <div className="space-y-4">
        {CONSENT_ITEMS.map((item) => {
          const key = item.name.split(".")[1] as keyof typeof consents

          const checked = !!consents?.[key]

          const fieldError =
            errors.consents &&
            (errors.consents as Record<string, { message?: string }>)[key]

          return (
            <div
              key={item.name}
              className="flex gap-3 rounded-lg border border-border/60 p-4"
            >
              <Checkbox
                id={item.name}
                checked={checked}
                onCheckedChange={(value) =>
                  setValue(item.name, !!value, {
                    shouldValidate: true,
                  })
                }
                className="mt-0.5"
              />

              <div className="space-y-1">
                <Label htmlFor={item.name} className="text-sm font-medium">
                  {item.label}

                  {item.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Label>

                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>

                {fieldError?.message && (
                  <p className="text-xs text-destructive">
                    {fieldError.message}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
