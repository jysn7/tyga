"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, fieldStyles, triggerStyles } from "./shared"
import { useMemberForm } from "@/context/new-member-form-context"

export function StepBasicInfo() {
  const {
    register,
    control,
    formState: { errors },
  } = useMemberForm()

  return (
    <div className="flex flex-col">
      <h1 className="pb-1 text-lg font-medium tracking-tight text-foreground">
        Let&apos;s add your child
      </h1>
      <p className="pb-4 text-sm text-muted-foreground">
        We will use this to check eligibility for programmes.
      </p>

      <Field label="Full name" error={errors.fullName?.message}>
        <Input
          className={fieldStyles}
          placeholder="Child's full name"
          {...register("fullName")}
        />
      </Field>

      <Field
        label="Date of birth"
        error={errors.dob?.message as string | undefined}
      >
        <Controller
          control={control}
          name="dob"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 py-0.5 text-[15px] text-foreground"
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span className="text-muted-foreground/60">
                      Select date of birth
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto border-border/60 p-0 shadow-md"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date > new Date()}
                  captionLayout="dropdown"
                  startMonth={new Date(2005, 0, 1)}
                  endMonth={new Date(new Date().getFullYear(), 11, 31)}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </Field>

      <Field label="Gender" error={errors.gender?.message}>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger className={triggerStyles}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="School name">
        <Input
          className={fieldStyles}
          placeholder="e.g. Sunnyside Primary"
          {...register("schoolName")}
        />
      </Field>

      <Field label="School grade">
        <Input
          className={fieldStyles}
          placeholder="e.g. Grade 5"
          {...register("schoolGrade")}
        />
      </Field>

      <Field label="ID / birth certificate number">
        <Input
          className={fieldStyles}
          placeholder="Child's ID or birth certificate number"
          {...register("idOrBirthCertNumber")}
        />
      </Field>

      <Field label="Previous team / club">
        <Input
          className={fieldStyles}
          placeholder="If your child has played elsewhere before"
          {...register("previousClub")}
        />
      </Field>
    </div>
  )
}
