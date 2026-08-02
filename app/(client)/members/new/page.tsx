"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
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

const STEPS = ["Basic info", "Health & safety", "About your golfer"] as const

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border/60 py-4 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {hint && (
        <span className="pt-0.5 text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  )
}

const fieldStyles =
  "border-none bg-secondary pl-2 shadow-none text-[15px] text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50"

const triggerStyles =
  "h-auto w-full justify-start border-none bg-transparent pl-2 text-[15px] font-normal text-foreground shadow-none hover:bg-transparent"

type FormState = {
  fullName: string
  dob?: Date
  gender: string
  medicalNotes: string
  emergencyContact: string
  skillLevel: string
  availability: string
  interests: string
  gearOwned: string
}

export default function NewMemberPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    fullName: "",
    dob: undefined,
    gender: "",
    medicalNotes: "",
    emergencyContact: "",
    skillLevel: "",
    availability: "",
    interests: "",
    gearOwned: "",
  })

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const isStepValid = (() => {
    if (step === 0)
      return form.fullName.trim().length > 0 && form.dob && form.gender
    if (step === 1) return true // optional fields
    if (step === 2) return form.skillLevel.length > 0
    return false
  })()

  const isLastStep = step === STEPS.length - 1

  async function handleNext() {
    if (!isStepValid) return
    if (isLastStep) {
      setIsSubmitting(true)
      // TODO: insert into `members`, then insert into `member_questionnaires`
      await new Promise((r) => setTimeout(r, 600))
      setIsSubmitting(false)
      router.push("/members")
      return
    }
    setStep((s) => s + 1)
  }

  function handleBack() {
    if (step === 0) {
      router.push("/members")
      return
    }
    setStep((s) => s - 1)
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col px-6 py-10">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-2">
            <div
              className={`h-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
            <span
              className={`text-xs transition-colors ${
                i === step ? "text-foreground" : "text-muted-foreground/60"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1">
        {step === 0 && (
          <div className="flex flex-col">
            <h1 className="pb-1 text-lg font-medium tracking-tight text-foreground">
              Let&apos;s add your child
            </h1>
            <p className="pb-4 text-sm text-muted-foreground">
              We will use this to check eligibility for programmes.
            </p>

            <Field label="Full name">
              <Input
                className={fieldStyles}
                placeholder="Child's full name"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </Field>

            <Field label="Date of birth">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 py-0.5 text-[15px] text-foreground">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {form.dob ? (
                      format(form.dob, "PPP")
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
                    selected={form.dob}
                    onSelect={(d) => update("dob", d)}
                    disabled={(date) => date > new Date()}
                    captionLayout="dropdown"
                    fromYear={2005}
                    toYear={new Date().getFullYear()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field label="Gender">
              <Select
                value={form.gender}
                onValueChange={(v) => update("gender", v)}
              >
                <SelectTrigger className={triggerStyles}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}

        {step === 1 && (
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
                value={form.emergencyContact}
                onChange={(e) => update("emergencyContact", e.target.value)}
              />
            </Field>

            <Field
              label="Medical notes"
              hint="Only visible to coaches directly teaching your child. Access is logged."
            >
              <Textarea
                className={`${fieldStyles} min-h-24 resize-none`}
                placeholder="Allergies, conditions, medication..."
                value={form.medicalNotes}
                onChange={(e) => update("medicalNotes", e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col">
            <h1 className="pb-1 text-lg font-medium tracking-tight text-foreground">
              About your golfer
            </h1>
            <p className="pb-4 text-sm text-muted-foreground">
              Helps us recommend the right programme and coach.
            </p>

            <Field label="Self-reported skill level">
              <Select
                value={form.skillLevel}
                onValueChange={(v) => update("skillLevel", v)}
              >
                <SelectTrigger className={triggerStyles}>
                  <SelectValue placeholder="Select a starting point" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never_played">Never played</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="some_experience">
                    Some experience
                  </SelectItem>
                  <SelectItem value="competitive">
                    Competitive / plays tournaments
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Availability">
              <Input
                className={fieldStyles}
                placeholder="e.g. Weekday afternoons, Saturday mornings"
                value={form.availability}
                onChange={(e) => update("availability", e.target.value)}
              />
            </Field>

            <Field label="Interests">
              <Input
                className={fieldStyles}
                placeholder="e.g. Short game, competing in tournaments"
                value={form.interests}
                onChange={(e) => update("interests", e.target.value)}
              />
            </Field>

            <Field label="Gear owned">
              <Input
                className={fieldStyles}
                placeholder="e.g. Junior club set, no bag yet"
                value={form.gearOwned}
                onChange={(e) => update("gearOwned", e.target.value)}
              />
            </Field>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-5">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <Button
          size="sm"
          className="rounded-md px-5 text-sm"
          disabled={!isStepValid || isSubmitting}
          onClick={handleNext}
        >
          {isSubmitting ? "Saving…" : isLastStep ? "Add member" : "Next"}
        </Button>
      </div>
    </div>
  )
}
