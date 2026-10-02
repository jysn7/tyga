"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
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
import { Field, fieldStyles } from "@/components/portals/shared/field"
import { useAdminCreateSlotForCoach } from "@/hooks/admin/appointments/use-admin-overrides"
import { useCoaches } from "@/hooks/admin/use-coaches"
import { useVenues, useLevels } from "@/hooks/lookups/use-lookups"
import type { AppointmentType } from "@/hooks/use-appointment-slots"

export function CreateSlotDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createSlot = useAdminCreateSlotForCoach()
  const { data: coaches } = useCoaches()
  const { data: venues } = useVenues()
  const { data: levels } = useLevels()

  const [coachId, setCoachId] = useState("")
  const [venueId, setVenueId] = useState("")
  const [levelId, setLevelId] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [type, setType] = useState<AppointmentType>("assessment")
  const [capacity, setCapacity] = useState("1")
  const [notes, setNotes] = useState("")

  function reset() {
    setCoachId("")
    setVenueId("")
    setLevelId("")
    setDate("")
    setStartTime("")
    setEndTime("")
    setType("assessment")
    setCapacity("1")
    setNotes("")
  }

  const canSubmit =
    !!coachId &&
    !!venueId &&
    !!date &&
    !!startTime &&
    !!endTime &&
    startTime < endTime

  function handleSubmit() {
    if (!canSubmit) return

    const startsAt = new Date(`${date}T${startTime}`).toISOString()
    const endsAt = new Date(`${date}T${endTime}`).toISOString()

    createSlot.mutate(
      {
        coachId: Number(coachId),
        venueId: Number(venueId),
        startsAt,
        endsAt,
        levelId: levelId && levelId !== "none" ? Number(levelId) : null,
        type,
        capacity: Number(capacity) || 1,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Slot opened",
            description: "The coach can see it in their availability.",
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
          <DialogTitle>Open a slot for a coach</DialogTitle>
          <DialogDescription>
            Create availability on behalf of a coach.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Coach">
              <Select
                value={coachId}
                onValueChange={(v) => setCoachId(v ?? "")}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a coach…" />
                </SelectTrigger>
                <SelectContent>
                  {(coaches ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.fullName}
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
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Date">
              <Input
                className={fieldStyles}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </Field>
            <Field label="Start">
              <Input
                className={fieldStyles}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Field>
            <Field label="End">
              <Input
                className={fieldStyles}
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </Field>
          </div>

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

          <Field label="Capacity">
            <Input
              className={fieldStyles}
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </Field>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the coach should know…"
              className="min-h-20 w-full resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>

          {startTime && endTime && startTime >= endTime && (
            <span className="text-xs text-destructive">
              End time must be after start time.
            </span>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createSlot.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createSlot.isPending}
          >
            {createSlot.isPending ? "Opening…" : "Open slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
