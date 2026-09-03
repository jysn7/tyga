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
        Emergency contact is required. Medical notes help coaches keep your
        child safe on the course.
      </p>

      <Field label="Emergency contact name">
        <Input
          className={fieldStyles}
          placeholder="Full name"
          {...register("emergencyContactName")}
        />
      </Field>

      <Field label="Relationship to child">
        <Input
          className={fieldStyles}
          placeholder="e.g. Mother, Father, Guardian"
          {...register("emergencyContactRelationship")}
        />
      </Field>

      <Field label="Emergency contact phone">
        <Input
          className={fieldStyles}
          placeholder="Phone number"
          type="tel"
          {...register("emergencyContactPhone")}
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

      <Field label="Medical aid details">
        <Input
          className={fieldStyles}
          placeholder="Scheme name and membership number"
          {...register("medicalAidDetails")}
        />
      </Field>

      <Field label="Doctor contact">
        <Input
          className={fieldStyles}
          placeholder="Doctor's name and phone number"
          {...register("doctorContact")}
        />
      </Field>
    </div>
  )
}
