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
    <div className="flex flex-col gap-6">
      {/* Intro */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium tracking-tight text-foreground">
          Let&apos;s add your child
        </h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll use this to create their profile.
        </p>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {/* Full name — spans both columns */}
        <div className="sm:col-span-2">
          <Field label="Full name" required error={errors.fullName?.message}>
            <Input placeholder="Child's full name" {...register("fullName")} />
          </Field>
        </div>

        {/* Date of birth */}
        <Field label="Date of birth" required error={errors.dob?.message}>
          <Controller
            control={control}
            name="dob"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center gap-2 rounded-md border border-border bg-input px-3 text-sm text-foreground transition-colors hover:bg-accent/40 focus-visible:border-primary focus-visible:outline-none data-[state=open]:border-primary"
                  >
                    <CalendarIcon
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                    {field.value ? (
                      <span>{format(field.value, "PPP")}</span>
                    ) : (
                      <span className="text-muted-foreground">Select date</span>
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
                    defaultMonth={field.value ?? maxDob}
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

        {/* Gender */}
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

        {/* School name */}
        <Field label="School name">
          <Input
            placeholder="e.g. Sunnyside Primary"
            {...register("schoolName")}
          />
        </Field>

        {/* School grade */}
        <Field label="School grade">
          <Input placeholder="e.g. Grade 5" {...register("schoolGrade")} />
        </Field>
      </div>
    </div>
  )
}
