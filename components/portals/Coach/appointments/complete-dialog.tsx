"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
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
import { useLevels } from "@/hooks/lookups/use-lookups"
import type { HeadCoachAppointment } from "@/hooks/coach/use-head-coach-appointments"

export function CompleteDialog({
  appt,
  open,
  onOpenChange,
  onComplete,
  isPending,
}: {
  appt: HeadCoachAppointment
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (assessedLevelId: number | null, notes?: string) => void
  isPending: boolean
}) {
  const { data: levels } = useLevels()
  const [assessedLevelId, setAssessedLevelId] = useState("")
  const [notes, setNotes] = useState(appt.notes ?? "")

  function handleSubmit() {
    onComplete(
      assessedLevelId && assessedLevelId !== "none"
        ? Number(assessedLevelId)
        : null,
      notes || undefined
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete appointment</DialogTitle>
          <DialogDescription>
            {appt.memberName} ·{" "}
            {appt.scheduledAt
              ? format(new Date(appt.scheduledAt), "EEE d MMM, HH:mm")
              : "—"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <Field label="Assessed level">
            <Select
              value={assessedLevelId || "none"}
              onValueChange={(v) =>
                setAssessedLevelId(v === "none" ? "" : (v ?? ""))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Not assessed">
                  {assessedLevelId
                    ? levels?.find((l) => l.id.toString() === assessedLevelId)
                        ?.name
                    : "Not assessed"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not assessed</SelectItem>
                {(levels ?? []).map((l) => (
                  <SelectItem key={l.id} value={l.id.toString()}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the assessment go?"
              className="min-h-24 resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Completing…" : "Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
