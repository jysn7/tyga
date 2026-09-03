"use client"

import { useMemberForm } from "@/context/new-member-form-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const CONSENT_ITEMS = [
  {
    name: "consents.medicalEmergency" as const,
    label: "Medical emergency consent",
    description:
      "I authorize TYGA staff to seek emergency medical treatment for my child if I cannot be reached.",
    required: true,
  },
  {
    name: "consents.indemnity" as const,
    label: "Indemnity form",
    description:
      "I accept the terms of the indemnity agreement and release TYGA from liability as outlined.",
    required: true,
  },
  {
    name: "consents.codeOfConduct" as const,
    label: "Code of conduct agreement",
    description:
      "My child and I agree to abide by TYGA's code of conduct at all sessions and events.",
    required: true,
  },
  {
    name: "consents.photoVideo" as const,
    label: "Photo / video consent",
    description:
      "I consent to my child being photographed or filmed for use on TYGA's social media and promotional materials.",
    required: false,
  },
  {
    name: "consents.transport" as const,
    label: "Transport consent",
    description:
      "I consent to my child being transported by TYGA staff for scheduled events when required.",
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
          Required under POPIA. Please review each item carefully.
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
                  setValue(item.name, !!value, { shouldValidate: true })
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
