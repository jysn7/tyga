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
import { Field } from "@/components/portals/shared/field"
import { useOpenAppointmentSlot } from "@/hooks/coach/use-coach-appointments"
import { useVenues, useLevels } from "@/hooks/lookups/use-lookups"
import type { AppointmentType } from "@/hooks/use-appointment-slots"
import {
  openSlotSchema,
  todayIso,
  nowHm,
} from "@/lib/validations/appointment-slots"

export function OpenSlotDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: venues } = useVenues()
  const { data: levels } = useLevels()
  const openSlot = useOpenAppointmentSlot()

  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [venueId, setVenueId] = useState("")
  const [levelId, setLevelId] = useState("")
  const [type, setType] = useState<AppointmentType>("assessment")
  const [capacity, setCapacity] = useState("1")
  const [notes, setNotes] = useState("")

  const today = todayIso()
  const now = nowHm()
  const isToday = date === today

  // ---- Live validation ----
  const live = useMemo(() => {
    const result = openSlotSchema.safeParse({
      date,
      startTime,
      endTime,
      venueId,
      capacity,
    })
    const errors: Partial<Record<string, string>> = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "_form"
        if (!errors[key]) errors[key] = issue.message
      }
    }
    return { errors, isValid: result.success }
  }, [date, startTime, endTime, venueId, capacity])

  function reset() {
    setDate("")
    setStartTime("")
    setEndTime("")
    setVenueId("")
    setLevelId("")
    setType("assessment")
    setCapacity("1")
    setNotes("")
  }

  function handleSubmit() {
    if (!live.isValid) return

    const parsed = openSlotSchema.safeParse({
      date,
      startTime,
      endTime,
      venueId,
      capacity,
    })
    if (!parsed.success) return

    const startsAt = new Date(`${date}T${startTime}`).toISOString()
    const endsAt = new Date(`${date}T${endTime}`).toISOString()

    openSlot.mutate(
      {
        venueId: Number(venueId),
        startsAt,
        endsAt,
        levelId: levelId && levelId !== "none" ? Number(levelId) : null,
        type,
        capacity: parsed.data.capacity,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Slot opened",
            description: "Parents can now book this slot.",
            type: "success",
            timeout: 4000,
          })
          reset()
          onOpenChange(false)
        },
        onError: (err) =>
          toast.add({
            title: "Failed to open slot",
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
          <DialogTitle>Open a slot</DialogTitle>
          <DialogDescription>
            Publish a time when parents can book you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Date">
              <Input
                type="date"
                value={date}
                min={today}
                onChange={(e) => {
                  const v = e.target.value
                  if (v && v < today) return
                  setDate(v)
                }}
                className="h-11"
              />
              {live.errors.date && (
                <p className="mt-1 text-[11px] text-destructive">
                  {live.errors.date}
                </p>
              )}
            </Field>
            <Field label="Start">
              <Input
                type="time"
                value={startTime}
                min={isToday ? now : undefined}
                onChange={(e) => {
                  const v = e.target.value
                  if (isToday && v && v < now) return
                  setStartTime(v)
                }}
                className="h-11"
              />
              {live.errors.startTime && (
                <p className="mt-1 text-[11px] text-destructive">
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
                <p className="mt-1 text-[11px] text-destructive">
                  {live.errors.endTime}
                </p>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Venue">
              <Select
                value={venueId}
                onValueChange={(v) => setVenueId(v ?? "")}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a venue…">
                    {venues?.find((v) => v.id.toString() === venueId)?.name}
                  </SelectValue>
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
                <p className="mt-1 text-[11px] text-destructive">
                  {live.errors.venueId}
                </p>
              )}
            </Field>

            <Field label="Level (optional)">
              <Select
                value={levelId || "none"}
                onValueChange={(v) => setLevelId(v === "none" ? "" : (v ?? ""))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Any level">
                    {levelId
                      ? levels?.find((l) => l.id.toString() === levelId)?.name
                      : "Any level"}
                  </SelectValue>
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
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <Field label="Capacity">
              <Input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="h-11"
              />
              {live.errors.capacity && (
                <p className="mt-1 text-[11px] text-destructive">
                  {live.errors.capacity}
                </p>
              )}
            </Field>
          </div>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything parents should know…"
              className="min-h-20 resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>

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
            disabled={openSlot.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!live.isValid || openSlot.isPending}
          >
            {openSlot.isPending ? "Opening…" : "Open slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
