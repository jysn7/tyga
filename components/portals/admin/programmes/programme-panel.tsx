"use client"

import { useState } from "react"
import {
  CalendarPlus,
  Settings,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import {
  useCreateProgramme,
  useUpdateProgramme,
} from "@/hooks/admin/programmes/use-programme-mutations"
import type {
  AdminProgramme,
  ProgrammeType,
} from "@/hooks/admin/programmes/use-programmes"
import type { Level } from "@/hooks/admin/levels/use-levels"
import type { Venue } from "@/hooks/admin/programmes/use-venues"

const TYPE_OPTIONS: { label: string; value: ProgrammeType }[] = [
  { label: "Development", value: "development" },
  { label: "Community", value: "weekly_community" },
  { label: "Holiday Camp", value: "holiday_camp" },
  { label: "Clinic", value: "clinic" },
  { label: "Corporate", value: "corporate" },
  { label: "League", value: "league" },
]

const GENDER_OPTIONS = [
  { label: "Any", value: "any" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
] as const

const STEPS = [
  { id: "basic", label: "Basic info", icon: Settings },
  { id: "details", label: "Details", icon: CalendarDays },
] as const

type StepId = (typeof STEPS)[number]["id"]

export function ProgrammePanel({
  programme,
  levels,
  venues,
  open,
  onOpenChange,
}: {
  programme: AdminProgramme | null
  levels: Level[]
  venues: Venue[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [activeStep, setActiveStep] = useState<StepId>("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Basic info fields
  const [name, setName] = useState(() => programme?.name ?? "")
  const [type, setType] = useState<string>(() => programme?.type ?? "")
  const [levelId, setLevelId] = useState(
    () => programme?.levelId?.toString() ?? ""
  )
  const [venueId, setVenueId] = useState(
    () => programme?.venueId?.toString() ?? ""
  )
  const [minAge, setMinAge] = useState(
    () => programme?.minAge?.toString() ?? ""
  )
  const [maxAge, setMaxAge] = useState(
    () => programme?.maxAge?.toString() ?? ""
  )
  const [genderRestriction, setGenderRestriction] = useState<string>(
    () => programme?.genderRestriction ?? "any"
  )

  // Details fields
  const [recurrenceRule, setRecurrenceRule] = useState(
    () => programme?.recurrenceRule ?? ""
  )
  const [termStart, setTermStart] = useState(() => programme?.termStart ?? "")
  const [termEnd, setTermEnd] = useState(() => programme?.termEnd ?? "")
  const [price, setPrice] = useState(() => programme?.price?.toString() ?? "")
  const [capacity, setCapacity] = useState(
    () => programme?.capacity?.toString() ?? ""
  )
  const [maxRatio, setMaxRatio] = useState(
    () => programme?.maxRatio?.toString() ?? ""
  )

  const createProgramme = useCreateProgramme()
  const updateProgramme = useUpdateProgramme()
  const isSaving =
    createProgramme.isPending || updateProgramme.isPending || isSubmitting
  const isEditing = programme !== null

  const currentStepIndex = STEPS.findIndex((s) => s.id === activeStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1

  const canSubmitBasic = name && type && venueId && minAge && maxAge
  const isStepValid = activeStep === "basic" ? canSubmitBasic : true

  async function handleSubmit() {
    setIsSubmitting(true)
    const input = {
      name,
      type: type as ProgrammeType,
      levelId: Number(levelId) || null,
      venueId: Number(venueId),
      minAge: Number(minAge) || null,
      maxAge: Number(maxAge) || null,
      genderRestriction: genderRestriction as "male" | "female" | "any",
      recurrenceRule: recurrenceRule || null,
      termStart: termStart || null,
      termEnd: termEnd || null,
      price: price ? Number(price) : 0,
      capacity: capacity ? Number(capacity) : 0,
      maxRatio: maxRatio ? Number(maxRatio) : null,
    }

    try {
      if (isEditing) {
        await updateProgramme.mutateAsync({ ...input, id: programme.id })
        toast.add({
          title: "Programme updated",
          type: "success",
          timeout: 4000,
        })
      } else {
        await createProgramme.mutateAsync(input)
        toast.add({
          title: "Programme created",
          type: "success",
          timeout: 4000,
        })
      }
      onOpenChange(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: isEditing
          ? "Failed to update programme"
          : "Failed to create programme",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNext() {
    if (!isStepValid) return
    if (isLastStep) {
      handleSubmit()
      return
    }
    setActiveStep(STEPS[currentStepIndex + 1].id)
  }

  function handleBack() {
    if (isFirstStep) return
    setActiveStep(STEPS[currentStepIndex - 1].id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-xl [&>button]:top-6 [&>button]:right-6 [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
        <DialogHeader className="flex flex-row items-center gap-3.5 space-y-0 p-0 pb-6 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
            <CalendarPlus
              className="h-4.5 w-4.5 text-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit programme" : "New programme"}
            </DialogTitle>
            <span className="truncate text-xs text-muted-foreground">
              {isEditing
                ? programme.name
                : "Set up a new programme for enrollment"}
            </span>
          </div>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 pb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  activeStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : index < currentStepIndex
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStepIndex ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  activeStep === step.id
                    ? "text-foreground"
                    : index < currentStepIndex
                      ? "text-muted-foreground"
                      : "text-muted-foreground/40"
                }`}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 rounded-full transition-colors ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          {activeStep === "basic" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Programme name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Saturday Junior Clinic"
                  className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Type
                </label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value ?? "")}
                >
                  <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Level
                </label>
                <Select
                  value={levelId}
                  onValueChange={(value) => setLevelId(value ?? "")}
                >
                  <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l.id} value={l.id.toString()}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Venue
                </label>
                <Select
                  value={venueId}
                  onValueChange={(value) => setVenueId(value ?? "")}
                >
                  <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((v) => (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Age range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    placeholder="Min"
                    className="h-11 flex-1 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    placeholder="Max"
                    className="h-11 flex-1 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Gender restriction
                </label>
                <Select
                  value={genderRestriction}
                  onValueChange={(value) =>
                    setGenderRestriction(value ?? "any")
                  }
                >
                  <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {activeStep === "details" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Recurrence
                </label>
                <Input
                  value={recurrenceRule}
                  onChange={(e) => setRecurrenceRule(e.target.value)}
                  placeholder="e.g. Mon, Wed 4pm–5pm"
                  className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Term start
                </label>
                <Input
                  type="date"
                  value={termStart}
                  onChange={(e) => setTermStart(e.target.value)}
                  className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Term end
                </label>
                <Input
                  type="date"
                  value={termEnd}
                  onChange={(e) => setTermEnd(e.target.value)}
                  className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Price (per term)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 1200"
                  className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Capacity
                </label>
                <Input
                  type="number"
                  min={0}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 12"
                  className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-normal text-muted-foreground">
                  Max coach ratio (optional)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={maxRatio}
                  onChange={(e) => setMaxRatio(e.target.value)}
                  placeholder="e.g. 8"
                  className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-row items-center justify-between gap-3 p-0 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep}
            className="text-xs"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <Button
            variant="secondary"
            disabled={!isStepValid || isSaving}
            onClick={handleNext}
            className="text-xs"
          >
            {isSaving
              ? "Saving..."
              : isLastStep
                ? isEditing
                  ? "Save changes"
                  : "Create programme"
                : "Next"}
            {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
