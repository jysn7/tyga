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
    <div className="flex flex-col gap-6">
      {/* Intro */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium tracking-tight text-foreground">
          Golf &amp; medical information
        </h1>
        <p className="text-sm text-muted-foreground">
          Helps us prepare the right kit and keep your child safe during
          coaching.
        </p>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {/* Golf shirt size */}
        <Field label="Golf shirt size">
          <Input placeholder="e.g. XS, S, M, L" {...register("kitSizeTop")} />
        </Field>

        {/* Shoe size */}
        <Field label="Shoe size">
          <Input placeholder="e.g. 4, 5, 6" {...register("shoeSize")} />
        </Field>

        {/* Medical notes — spans both columns */}
        <div className="sm:col-span-2">
          <Field
            label="Medical notes"
            error={errors.medicalNotes?.message}
            hint="Allergies, medical conditions, medication, previous injuries — anything coaches should know."
          >
            <Textarea
              className="min-h-24 resize-none"
              placeholder="Optional"
              {...register("medicalNotes")}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
