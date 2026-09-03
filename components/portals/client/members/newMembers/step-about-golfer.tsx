"use client"

import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, fieldStyles, triggerStyles } from "./shared"
import { useMemberForm } from "@/context/new-member-form-context"

export function StepAboutGolfer() {
  const {
    register,
    control,
    formState: { errors },
  } = useMemberForm()

  return (
    <div className="flex flex-col">
      <h1 className="pb-1 text-lg font-medium tracking-tight text-foreground">
        About your golfer
      </h1>
      <p className="pb-4 text-sm text-muted-foreground">
        Helps us recommend the right programme and coach.
      </p>

      <Field
        label="Self-reported skill level"
        error={errors.skillLevel?.message}
      >
        <Controller
          control={control}
          name="skillLevel"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger className={triggerStyles}>
                <SelectValue placeholder="Select a starting point" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never_played">Never played</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="some_experience">Some experience</SelectItem>
                <SelectItem value="competitive">
                  Competitive / plays tournaments
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="Availability">
        <Input
          className={fieldStyles}
          placeholder="e.g. Weekday afternoons, Saturday mornings"
          {...register("availability")}
        />
      </Field>

      <Field label="Interests">
        <Input
          className={fieldStyles}
          placeholder="e.g. Short game, competing in tournaments"
          {...register("interests")}
        />
      </Field>

      <Field label="Gear owned">
        <Input
          className={fieldStyles}
          placeholder="e.g. Junior club set, no bag yet"
          {...register("gearOwned")}
        />
      </Field>

      <Field label="Kit size (top)">
        <Input
          className={fieldStyles}
          placeholder="e.g. Youth M"
          {...register("kitSizeTop")}
        />
      </Field>

      <Field label="Kit size (bottom)">
        <Input
          className={fieldStyles}
          placeholder="e.g. Youth M"
          {...register("kitSizeBottom")}
        />
      </Field>

      <Field label="Shoe size">
        <Input
          className={fieldStyles}
          placeholder="e.g. UK 3"
          {...register("shoeSize")}
        />
      </Field>
    </div>
  )
}
