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
        Golf &amp; medical information
      </h1>

      <p className="pb-4 text-sm text-muted-foreground">
        Help us prepare the correct kit size and keep your child safe during
        coaching sessions.
      </p>

      <Field label="Golf shirt size">
        <Input placeholder="e.g. XS, S, M, L" {...register("kitSizeTop")} />
      </Field>

      <Field label="Shoe size">
        <Input placeholder="e.g. 4, 5, 6" {...register("shoeSize")} />
      </Field>

      <Field
        label="Medical notes"
        error={errors.medicalNotes?.message}
        hint="Allergies, medical conditions, medication, previous injuries, or any information coaches should be aware of."
      >
        <Textarea
          className="min-h-24 resize-none"
          placeholder="Optional"
          {...register("medicalNotes")}
        />
      </Field>
    </div>
  )
}
