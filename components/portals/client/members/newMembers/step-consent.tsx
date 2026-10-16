"use client"

import { useState } from "react"
import { useMemberForm } from "@/context/new-member-form-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { CONSENT_DOCUMENTS, type ConsentKey } from "@/lib/consents/consents"

const CONSENT_ITEMS: {
  name: `consents.${ConsentKey}`
  key: ConsentKey
  required: boolean
}[] = [
  { name: "consents.membership", key: "membership", required: true },
  {
    name: "consents.medicalEmergency",
    key: "medicalEmergency",
    required: true,
  },
  { name: "consents.indemnity", key: "indemnity", required: true },
  { name: "consents.codeOfConduct", key: "codeOfConduct", required: true },
  { name: "consents.photoVideo", key: "photoVideo", required: false },
  { name: "consents.transport", key: "transport", required: false },
]

export function StepConsent() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useMemberForm()

  const consents = watch("consents")
  const [openDoc, setOpenDoc] = useState<ConsentKey | null>(null)

  const activeDoc = openDoc ? CONSENT_DOCUMENTS[openDoc] : null

  return (
    <div className="flex flex-col gap-6">
      {/* Intro */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium tracking-tight text-foreground">
          Consent &amp; compliance
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and accept the required agreements before completing
          registration. Tap a name to read the full document.
        </p>
      </div>

      {/* Consent list */}
      <div className="flex flex-col divide-y divide-border/60">
        {CONSENT_ITEMS.map((item) => {
          const doc = CONSENT_DOCUMENTS[item.key]
          const checked = !!consents?.[item.key]
          const fieldError =
            errors.consents &&
            (errors.consents as Record<string, { message?: string }>)[item.key]

          return (
            <div
              key={item.name}
              className="flex gap-3 py-4 first:pt-0 last:pb-0"
            >
              <Checkbox
                id={item.name}
                checked={checked}
                onCheckedChange={(value) =>
                  setValue(item.name, !!value, { shouldValidate: true })
                }
                className="mt-0.5"
              />

              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1.5">
                  <Label
                    htmlFor={item.name}
                    className="cursor-pointer text-sm font-medium"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenDoc(item.key)}
                      className="cursor-pointer text-left underline decoration-dotted underline-offset-4 transition-colors hover:text-information"
                    >
                      {doc.label}
                    </button>
                  </Label>
                  {item.required && (
                    <span className="text-destructive" aria-hidden>
                      *
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">{doc.summary}</p>

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

      {/* Document viewer */}
      <SidePanel
        open={openDoc !== null}
        onOpenChange={(o) => !o && setOpenDoc(null)}
        title={activeDoc?.label ?? "Consent"}
        description={
          activeDoc
            ? activeDoc.required
              ? "Required to complete registration"
              : "Optional"
            : undefined
        }
        header={
          activeDoc && (
            <div className="flex flex-col gap-1 border-b border-border/60 px-8 pt-8 pb-4">
              <span className="text-xl font-semibold tracking-tight text-foreground">
                {activeDoc.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {activeDoc.required
                  ? "Required to complete registration"
                  : "Optional"}
              </span>
            </div>
          )
        }
      >
        {activeDoc && (
          <div className="flex flex-col gap-5">
            {activeDoc.sections.map((section) => (
              <div key={section.heading} className="flex flex-col gap-1.5">
                <h3 className="text-sm font-medium tracking-tight text-foreground">
                  {section.heading}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </SidePanel>
    </div>
  )
}
