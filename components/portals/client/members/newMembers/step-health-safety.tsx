"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, fieldStyles } from "./shared"
import { useMemberForm } from "@/context/new-member-form-context"

export function StepHealthSafety() {
  const { register } = useMemberForm()

  return (
    <div className="flex flex-col">
      <h1 className="pb-1 text-lg font-medium tracking-tight text-foreground">
        Health & safety
      </h1>
      <p className="pb-4 text-sm text-muted-foreground">
        Optional, but helps coaches keep your child safe on the course.
      </p>

      <Field label="Emergency contact">
        <Input
          className={fieldStyles}
          placeholder="Name and phone number"
          {...register("emergencyContact")}
        />
      </Field>

      <Field
        label="Medical notes"
        hint="Only visible to coaches directly teaching your child. Access is logged."
      >
        <Textarea
          className={`${fieldStyles} min-h-24 resize-none`}
          placeholder="Allergies, conditions, medication..."
          {...register("medicalNotes")}
        />
      </Field>
    </div>
  )
}
