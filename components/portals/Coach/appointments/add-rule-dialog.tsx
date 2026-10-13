"use client"

import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateAvailabilityRule } from "@/hooks/coach/use-coach-availability"
import { useVenues, useLevels } from "@/hooks/lookups/use-lookups"
import type { AppointmentType } from "@/hooks/use-appointment-slots"
import { addRuleSchema, todayIso } from "@/lib/validations/appointment-slots"

const DAY_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
]

const DURATION_OPTIONS = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
]

export function AddRuleDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: venues } = useVenues()
  const { data: levels } = useLevels()
  const createRule = useCreateAvailabilityRule()

  const [dayOfWeek, setDayOfWeek] = useState("1")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("12:00")
  const [slotMinutes, setSlotMinutes] = useState("60")
  const [venueId, setVenueId] = useState("")
  const [levelId, setLevelId] = useState("")
  const [type, setType] = useState<AppointmentType>("assessment")
  const [capacity, setCapacity] = useState("1")
  const [validFrom, setValidFrom] = useState(todayIso())
  const [validUntil, setValidUntil] = useState("")

  const today = todayIso()

  // ---- Live validation ----
  const live = useMemo(() => {
    const result = addRuleSchema.safeParse({
      dayOfWeek,
      startTime,
      endTime,
      slotMinutes,
      venueId,
      capacity,
      validFrom,
      validUntil,
    })
    const errors: Partial<Record<string, string>> = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "_form"
        if (!errors[key]) errors[key] = issue.message
      }
    }
    return { errors, isValid: result.success }
  }, [
    dayOfWeek,
    startTime,
    endTime,
    slotMinutes,
    venueId,
    capacity,
    validFrom,
    validUntil,
  ])

  function reset() {
    setDayOfWeek("1")
    setStartTime("09:00")
    setEndTime("12:00")
    setSlotMinutes("60")
    setVenueId("")
    setLevelId("")
    setType("assessment")
    setCapacity("1")
    setValidFrom(todayIso())
    setValidUntil("")
  }

  function handleSubmit() {
    if (!live.isValid) return

    const parsed = addRuleSchema.safeParse({
      dayOfWeek,
      startTime,
      endTime,
      slotMinutes,
      venueId,
      capacity,
      validFrom,
      validUntil,
    })
    if (!parsed.success) return

    createRule.mutate(
      {
        venueId: Number(parsed.data.venueId),
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        slotMinutes: parsed.data.slotMinutes,
        levelId: levelId && levelId !== "none" ? Number(levelId) : null,
        type,
        capacity: parsed.data.capacity,
        validFrom: parsed.data.validFrom,
        validUntil: parsed.data.validUntil || null,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Rule added",
            description:
              'Click "Apply" on the rule to generate bookable slots.',
            type: "success",
            timeout: 5000,
          })
          reset()
          onOpenChange(false)
        },
        onError: (err) =>
          toast.add({
            title: "Failed to add rule",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add recurring rule</DialogTitle>
          <DialogDescription>
            Sets your weekly schedule. Nothing becomes bookable until you apply
            the rule.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Day + venue */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Day of week">
              <Select
                value={dayOfWeek}
                onValueChange={(v) => setDayOfWeek(v ?? "1")}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Venue">
              <Select
                value={venueId}
                onValueChange={(v) => setVenueId(v ?? "")}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a venue…" />
                </SelectTrigger>
                <SelectContent>
                  {(venues ?? []).map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {live.errors.venueId && (
                <p className="text-[11px] text-destructive">
                  {live.errors.venueId}
                </p>
              )}
            </Field>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Start">
              <Input
                type="time"
                value={startTime}
                onChange={(e) => {
                  const v = e.target.value
                  if (v && endTime && v >= endTime) return
                  setStartTime(v)
                }}
                className="h-11"
              />
              {live.errors.startTime && (
                <p className="text-[11px] text-destructive">
                  {live.errors.startTime}
                </p>
              )}
            </Field>
            <Field label="End">
              <Input
                type="time"
                value={endTime}
                min={startTime || undefined}
                onChange={(e) => {
                  const v = e.target.value
                  if (v && startTime && v <= startTime) return
                  setEndTime(v)
                }}
                className="h-11"
              />
              {live.errors.endTime && (
                <p className="text-[11px] text-destructive">
                  {live.errors.endTime}
                </p>
              )}
            </Field>
            <Field label="Slot length">
              <Select
                value={slotMinutes}
                onValueChange={(v) => setSlotMinutes(v ?? "60")}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {live.errors.slotMinutes && (
                <p className="text-[11px] text-destructive">
                  {live.errors.slotMinutes}
                </p>
              )}
            </Field>
          </div>

          {/* Level + type */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Level (optional)">
              <Select
                value={levelId || "none"}
                onValueChange={(v) => setLevelId(v === "none" ? "" : (v ?? ""))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any level</SelectItem>
                  {(levels ?? []).map((l) => (
                    <SelectItem key={l.id} value={l.id.toString()}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Type">
              <Select
                value={type}
                onValueChange={(v) =>
                  setType((v ?? "assessment") as AppointmentType)
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="parent_consultation">
                    Parent consultation
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Capacity + validity */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Capacity">
              <Input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="h-11"
              />
              {live.errors.capacity && (
                <p className="text-[11px] text-destructive">
                  {live.errors.capacity}
                </p>
              )}
            </Field>
            <Field label="Valid from">
              <Input
                type="date"
                value={validFrom}
                min={today}
                onChange={(e) => {
                  const v = e.target.value
                  if (v && v < today) return
                  setValidFrom(v)
                }}
                className="h-11"
              />
              {live.errors.validFrom && (
                <p className="text-[11px] text-destructive">
                  {live.errors.validFrom}
                </p>
              )}
            </Field>
            <Field label="Valid until">
              <Input
                type="date"
                value={validUntil}
                min={validFrom || today}
                onChange={(e) => {
                  const v = e.target.value
                  const floor = validFrom || today
                  if (v && v < floor) return
                  setValidUntil(v)
                }}
                placeholder="No end date"
                className="h-11"
              />
              {live.errors.validUntil && (
                <p className="text-[11px] text-destructive">
                  {live.errors.validUntil}
                </p>
              )}
            </Field>
          </div>

          {live.errors.endTime && startTime && endTime && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
              {live.errors.endTime}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createRule.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!live.isValid || createRule.isPending}
          >
            {createRule.isPending ? "Adding…" : "Add rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}
