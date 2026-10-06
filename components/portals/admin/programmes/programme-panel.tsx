"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import {
  CalendarPlus,
  Settings,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ImagePlus,
  X,
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/portals/shared/confirm-dialog"
import { createClient } from "@/utils/supabase/client"
import {
  useCreateProgramme,
  useUpdateProgramme,
} from "@/hooks/admin/programmes/use-programme-mutations"
import type { AdminProgramme } from "@/hooks/admin/programmes/use-programmes"
import type { Level } from "@/hooks/admin/levels/use-levels"
import type { Venue } from "@/hooks/admin/programmes/use-venues"
import {
  programmeFormSchema,
  type ProgrammeFormValues,
  type ProgrammeType,
  type GenderRestriction,
} from "@/lib/validations/programme"

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

const inputClass =
  "h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
const triggerClass =
  "h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

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
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fields the user has interacted with — errors only render for these
  const [touched, setTouched] = useState<Set<string>>(new Set())

  // Past-date confirmation
  const [pastDateConfirmOpen, setPastDateConfirmOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] =
    useState<ProgrammeFormValues | null>(null)

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
  const [description, setDescription] = useState(
    () => programme?.description ?? ""
  )
  const [imageUrl, setImageUrl] = useState<string | null>(
    () => programme?.imageUrl ?? null
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

  // -------- Validation --------

  const formValues: ProgrammeFormValues = {
    name: name.trim(),
    type: (type || undefined) as ProgrammeType,
    levelId: levelId === "" ? null : Number(levelId),
    venueId: Number(venueId) || 0,
    minAge: Number(minAge) || 0,
    maxAge: Number(maxAge) || 0,
    genderRestriction: genderRestriction as GenderRestriction,
    description: description.trim(),
    imageUrl,
    recurrenceRule: recurrenceRule.trim(),
    termStart,
    termEnd,
    price: price === "" ? undefined : Number(price),
    capacity: capacity === "" ? undefined : Number(capacity),
    maxRatio: maxRatio === "" ? null : Number(maxRatio),
  }

  const pastStart = !!termStart && termStart < todayIso()
  const pastEnd = !!termEnd && termEnd < todayIso()

  const parsed = programmeFormSchema.safeParse(formValues)

  const allErrors: Partial<Record<string, string>> = {}
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "_form"
      if (!allErrors[key]) allErrors[key] = issue.message
    }
  }

  // Only show an error for a field the user has touched
  const errors: Partial<Record<string, string>> = {}
  for (const [key, message] of Object.entries(allErrors)) {
    if (touched.has(key)) errors[key] = message
  }

  // Validity ignores touched state — the button is enabled based on
  // whether the form is actually valid, not whether the user has seen errors
  const canSubmitBasic =
    !allErrors.name &&
    !allErrors.type &&
    !allErrors.venueId &&
    !allErrors.minAge &&
    !allErrors.maxAge

  const canSubmitDetails =
    !allErrors.termEnd &&
    !allErrors.price &&
    !allErrors.capacity &&
    !allErrors.maxRatio

  const isStepValid = activeStep === "basic" ? canSubmitBasic : canSubmitDetails

  function markTouched(field: string) {
    setTouched((prev) => {
      if (prev.has(field)) return prev
      const next = new Set(prev)
      next.add(field)
      return next
    })
  }

  function markAllTouched() {
    setTouched(
      new Set([
        "name",
        "type",
        "venueId",
        "description",
        "minAge",
        "maxAge",
        "recurrenceRule",
        "termStart",
        "termEnd",
        "price",
        "capacity",
        "maxRatio",
      ])
    )
  }

  // Selected labels — pass to SelectValue so Radix doesn't render raw ids
  const selectedLevelLabel = levels.find(
    (l) => l.id.toString() === levelId
  )?.name
  const selectedVenueLabel = venues.find(
    (v) => v.id.toString() === venueId
  )?.name

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("programme-images")
      .upload(path, file, { upsert: false, cacheControl: "3600" })

    if (uploadError) {
      toast.add({
        title: "Failed to upload image",
        description: uploadError.message,
        type: "error",
        timeout: 5000,
      })
      setIsUploading(false)
      return
    }

    const { data } = supabase.storage
      .from("programme-images")
      .getPublicUrl(path)

    setImageUrl(data.publicUrl)
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleRemoveImage() {
    setImageUrl(null)
  }

  async function doSubmit(data: ProgrammeFormValues) {
    setIsSubmitting(true)

    const input = {
      name: data.name,
      type: data.type,
      levelId: data.levelId ?? null,
      venueId: data.venueId,
      minAge: data.minAge,
      maxAge: data.maxAge,
      genderRestriction: data.genderRestriction,
      recurrenceRule: data.recurrenceRule || null,
      termStart: data.termStart || null,
      termEnd: data.termEnd || null,
      price: data.price ?? 0,
      capacity: data.capacity ?? 0,
      maxRatio: data.maxRatio ?? null,
      description: data.description || null,
      imageUrl: data.imageUrl ?? null,
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

  async function handleSubmit() {
    // Reveal every error at once on an explicit submit attempt
    markAllTouched()

    const result = programmeFormSchema.safeParse(formValues)

    if (!result.success) {
      const first = result.error.issues[0]
      toast.add({
        title: "Please fix the errors before saving",
        description: first?.message,
        type: "error",
        timeout: 4000,
      })
      return
    }

    const data = result.data

    if (pastStart || pastEnd) {
      setPendingSubmit(data)
      setPastDateConfirmOpen(true)
      return
    }

    await doSubmit(data)
  }

  function confirmPastDateSubmit() {
    setPastDateConfirmOpen(false)
    if (pendingSubmit) {
      doSubmit(pendingSubmit)
      setPendingSubmit(null)
    }
  }

  function handleNext() {
    if (!isStepValid) {
      // Reveal errors on the step so the user knows why Next is blocked
      markAllTouched()
      return
    }
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
    <>
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
                {/* Image picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-muted-foreground">
                    Cover image
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-input">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Programme cover"
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <ImagePlus
                          className="h-5 w-5 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="text-xs"
                        >
                          <ImagePlus className="mr-1 h-3.5 w-3.5" />
                          {isUploading
                            ? "Uploading..."
                            : imageUrl
                              ? "Replace"
                              : "Upload image"}
                        </Button>
                        {imageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveImage}
                            className="text-xs text-muted-foreground hover:text-destructive"
                          >
                            <X className="mr-1 h-3.5 w-3.5" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        JPG, PNG, or WebP · up to 5 MB
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-muted-foreground">
                    Programme name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => markTouched("name")}
                    placeholder="e.g. Saturday Junior Clinic"
                    className={inputClass}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-muted-foreground">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => markTouched("description")}
                    placeholder="What is this programme about?"
                    rows={3}
                    className="resize-none rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-muted-foreground">
                    Type
                  </label>
                  <Select
                    value={type}
                    onValueChange={(value) => {
                      setType(value ?? "")
                      markTouched("type")
                    }}
                  >
                    <SelectTrigger className={triggerClass}>
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
                  {errors.type && (
                    <p className="text-xs text-destructive">{errors.type}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-muted-foreground">
                    Level
                  </label>
                  <Select
                    value={levelId}
                    onValueChange={(value) => setLevelId(value ?? "")}
                  >
                    <SelectTrigger className={triggerClass}>
                      <SelectValue placeholder="Select a level">
                        {selectedLevelLabel}
                      </SelectValue>
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
                    onValueChange={(value) => {
                      setVenueId(value ?? "")
                      markTouched("venueId")
                    }}
                  >
                    <SelectTrigger className={triggerClass}>
                      <SelectValue placeholder="Select a venue">
                        {selectedVenueLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.venueId && (
                    <p className="text-xs text-destructive">{errors.venueId}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-muted-foreground">
                    Age range
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={3}
                      max={100}
                      value={minAge}
                      onChange={(e) => {
                        setMinAge(e.target.value)
                        markTouched("minAge")
                        markTouched("maxAge")
                      }}
                      onBlur={() => {
                        markTouched("minAge")
                        markTouched("maxAge")
                      }}
                      placeholder="Min"
                      className={`${inputClass} flex-1`}
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="number"
                      min={3}
                      max={100}
                      value={maxAge}
                      onChange={(e) => {
                        setMaxAge(e.target.value)
                        markTouched("minAge")
                        markTouched("maxAge")
                      }}
                      onBlur={() => {
                        markTouched("minAge")
                        markTouched("maxAge")
                      }}
                      placeholder="Max"
                      className={`${inputClass} flex-1`}
                    />
                  </div>
                  {(errors.minAge || errors.maxAge) && (
                    <p className="text-xs text-destructive">
                      {errors.minAge ?? errors.maxAge}
                    </p>
                  )}
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
                    <SelectTrigger className={triggerClass}>
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
                    onBlur={() => markTouched("recurrenceRule")}
                    placeholder="e.g. Mon, Wed 4pm–5pm"
                    className={inputClass}
                  />
                  {errors.recurrenceRule && (
                    <p className="text-xs text-destructive">
                      {errors.recurrenceRule}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-muted-foreground">
                    Term start
                  </label>
                  <Input
                    type="date"
                    value={termStart}
                    onChange={(e) => {
                      setTermStart(e.target.value)
                      markTouched("termStart")
                      markTouched("termEnd")
                    }}
                    onBlur={() => {
                      markTouched("termStart")
                      markTouched("termEnd")
                    }}
                    className={inputClass}
                  />
                  {errors.termStart && (
                    <p className="text-xs text-destructive">
                      {errors.termStart}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-muted-foreground">
                    Term end
                  </label>
                  <Input
                    type="date"
                    value={termEnd}
                    onChange={(e) => {
                      setTermEnd(e.target.value)
                      markTouched("termStart")
                      markTouched("termEnd")
                    }}
                    onBlur={() => {
                      markTouched("termStart")
                      markTouched("termEnd")
                    }}
                    className={inputClass}
                  />
                  {errors.termEnd && (
                    <p className="text-xs text-destructive">{errors.termEnd}</p>
                  )}
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
                    onBlur={() => markTouched("price")}
                    placeholder="e.g. 1200"
                    className={inputClass}
                  />
                  {errors.price && (
                    <p className="text-xs text-destructive">{errors.price}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-muted-foreground">
                    Capacity
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    onBlur={() => markTouched("capacity")}
                    placeholder="e.g. 12"
                    className={inputClass}
                  />
                  {errors.capacity && (
                    <p className="text-xs text-destructive">
                      {errors.capacity}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-muted-foreground">
                    Max coach ratio (optional)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={maxRatio}
                    onChange={(e) => setMaxRatio(e.target.value)}
                    onBlur={() => markTouched("maxRatio")}
                    placeholder="e.g. 8"
                    className={inputClass}
                  />
                  {errors.maxRatio && (
                    <p className="text-xs text-destructive">
                      {errors.maxRatio}
                    </p>
                  )}
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
              disabled={isSaving || isUploading}
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

      <ConfirmDialog
        open={pastDateConfirmOpen}
        onOpenChange={setPastDateConfirmOpen}
        title={
          pastStart && pastEnd
            ? "Dates are in the past"
            : pastStart
              ? "Start date is in the past"
              : "End date is in the past"
        }
        description={
          pendingSubmit ? (
            pastStart && pastEnd ? (
              <>
                This programme runs from{" "}
                <strong>{pendingSubmit.termStart}</strong> to{" "}
                <strong>{pendingSubmit.termEnd}</strong>, both of which have
                already passed. Create it anyway?
              </>
            ) : pastStart ? (
              <>
                The term start <strong>{pendingSubmit.termStart}</strong> is in
                the past. The programme ends{" "}
                <strong>{pendingSubmit.termEnd}</strong>. Create it anyway?
              </>
            ) : (
              <>
                The term end <strong>{pendingSubmit.termEnd}</strong> is in the
                past. The programme started{" "}
                <strong>{pendingSubmit.termStart}</strong>. Create it anyway?
              </>
            )
          ) : null
        }
        confirmLabel="Create anyway"
        cancelLabel="Go back"
        onConfirm={confirmPastDateSubmit}
        loading={isSaving}
      />
    </>
  )
}
