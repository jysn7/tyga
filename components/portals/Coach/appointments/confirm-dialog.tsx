"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field } from "@/components/portals/shared/field"
import type { HeadCoachAppointment } from "@/hooks/coach/use-head-coach-appointments"

export function ConfirmDialog({
  appt,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  appt: HeadCoachAppointment
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (scheduledAt: string, notes?: string) => void
  isPending: boolean
}) {
  const defaultDate = appt.slotStartsAt
    ? format(new Date(appt.slotStartsAt), "yyyy-MM-dd")
    : ""
  const defaultTime = appt.slotStartsAt
    ? format(new Date(appt.slotStartsAt), "HH:mm")
    : ""

  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState(defaultTime)
  const [notes, setNotes] = useState(appt.notes ?? "")

  const canSubmit = !!date && !!time

  function handleSubmit() {
    if (!canSubmit) return
    const iso = new Date(`${date}T${time}`).toISOString()
    onConfirm(iso, notes || undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm appointment</DialogTitle>
          <DialogDescription>
            {appt.memberName} · {appt.venueName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Date">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </Field>
            <Field label="Time">
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11"
              />
            </Field>
          </div>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions for the parent…"
              className="min-h-20 resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
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
          <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending ? "Confirming…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
