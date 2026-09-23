"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "./shared"
import { useMemberForm } from "@/context/new-member-form-context"

export function StepHealthSafety() {
  const {
    register,
    formState: { errors },
  } = useMemberForm()

  return (
    <div className="flex flex-col">
      <h1 className="pb-1 text-lg font-medium tracking-tight text-foreground">
        Health &amp; safety
      </h1>
      <p className="pb-4 text-sm text-muted-foreground">
        Emergency contact is required. Medical notes help coaches keep your
        child safe on the course.
      </p>

      <Field
        label="Emergency contact name"
        required
        error={errors.emergencyContactName?.message}
      >
        <Input placeholder="Full name" {...register("emergencyContactName")} />
      </Field>

      <Field
        label="Relationship to child"
        required
        error={errors.emergencyContactRelationship?.message}
      >
        <Input
          placeholder="e.g. Mother, Father, Guardian"
          {...register("emergencyContactRelationship")}
        />
      </Field>

      <Field
        label="Emergency contact phone"
        required
        error={errors.emergencyContactPhone?.message}
      >
        <Input
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
          className="min-h-24 resize-none"
          placeholder="Allergies, conditions, medication..."
          {...register("medicalNotes")}
        />
      </Field>

      <Field label="Medical aid details">
        <Input
          placeholder="Scheme name and membership number"
          {...register("medicalAidDetails")}
        />
      </Field>

      <Field label="Doctor contact">
        <Input
          placeholder="Doctor's name and phone number"
          {...register("doctorContact")}
        />
      </Field>
    </div>
  )
}
