"use client"

import { useState } from "react"
import { format } from "date-fns"
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
import { useAdminConfirmAppointment } from "@/hooks/admin/appointments/use-admin-overrides"
import { useCoaches } from "@/hooks/admin/use-coaches"
import type { ScheduleEntry } from "@/hooks/shared/use-schedule"

export function ConfirmAppointmentDialog({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: ScheduleEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const confirm = useAdminConfirmAppointment()
  const { data: coaches } = useCoaches()

  const defaultDate = format(new Date(appointment.startsAt), "yyyy-MM-dd")
  const defaultTime = format(new Date(appointment.startsAt), "HH:mm")

  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState(defaultTime)
  const [coachId, setCoachId] = useState("")
  const [notes, setNotes] = useState("")

  const canSubmit = !!date && !!time && !!coachId

  function handleSubmit() {
    if (!canSubmit) return

    const scheduledAt = new Date(`${date}T${time}`).toISOString()

    // The appointment ID comes prefixed as "appt-N" from the schedule RPC.
    const appointmentId = Number(appointment.id.replace("appt-", ""))

    confirm.mutate(
      {
        appointmentId,
        coachId: Number(coachId),
        scheduledAt,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Appointment confirmed",
            type: "success",
            timeout: 4000,
          })
          onOpenChange(false)
        },
        onError: (err) =>
          toast.add({
            title: "Failed to confirm",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm appointment</DialogTitle>
          <DialogDescription>{appointment.title}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <Input
                className={fieldStyles}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Time">
              <Input
                className={fieldStyles}
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Assign to coach" hint="Who will run this assessment">
            <Select value={coachId} onValueChange={(v) => setCoachId(v ?? "")}>
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

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions for the coach or parent…"
              className="min-h-20 w-full resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={confirm.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || confirm.isPending}
          >
            {confirm.isPending ? "Confirming…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
