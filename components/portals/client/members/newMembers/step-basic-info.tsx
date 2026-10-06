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
import { Field, triggerStyles } from "./shared"
import { useMemberForm } from "@/context/new-member-form-context"

const MIN_AGE = 6
const MAX_AGE = 22

function ageInYears(dob: Date, now: Date = new Date()): number {
  return (
    now.getFullYear() -
    dob.getFullYear() -
    (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0)
  )
}

export function StepBasicInfo() {
  const {
    register,
    control,
    formState: { errors },
  } = useMemberForm()

  const today = new Date()
  const minDob = new Date(
    today.getFullYear() - MAX_AGE,
    today.getMonth(),
    today.getDate()
  )
  const maxDob = new Date(
    today.getFullYear() - MIN_AGE,
    today.getMonth(),
    today.getDate()
  )

  return (
    <div className="flex flex-col">
      <h1 className="pb-1 text-lg font-medium tracking-tight text-foreground">
        Let&apos;s add your child
      </h1>

      <p className="pb-4 text-sm text-muted-foreground">
        We will use this information to create your child&apos;s profile.
      </p>

      <Field label="Full name" required error={errors.fullName?.message}>
        <Input placeholder="Child's full name" {...register("fullName")} />
      </Field>

      <Field label="Date of birth" required error={errors.dob?.message}>
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
                  disabled={(date) => {
                    const age = ageInYears(date)
                    return date > today || age < MIN_AGE || age > MAX_AGE
                  }}
                  captionLayout="dropdown"
                  startMonth={minDob}
                  endMonth={maxDob}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </Field>

      <Field label="Gender" required error={errors.gender?.message}>
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
          placeholder="e.g. Sunnyside Primary"
          {...register("schoolName")}
        />
      </Field>

      <Field label="School grade">
        <Input placeholder="e.g. Grade 5" {...register("schoolGrade")} />
      </Field>
    </div>
  )
}
