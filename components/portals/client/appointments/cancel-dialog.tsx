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
import type { ParentAppointment } from "@/hooks/client/use-parent-appointments"

export function CancelDialog({
  appointment,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  appointment: ParentAppointment
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  isPending: boolean
}) {
  const [reason, setReason] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel appointment?</DialogTitle>
          <DialogDescription>
            {appointment.memberName} ·{" "}
            {appointment.scheduledAt
              ? format(new Date(appointment.scheduledAt), "EEE d MMM, HH:mm")
              : appointment.slotStartsAt
                ? format(new Date(appointment.slotStartsAt), "EEE d MMM, HH:mm")
                : "—"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Reason (optional)
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let the academy know why…"
            className="min-h-20 resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Keep it
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(reason)}
            disabled={isPending}
          >
            {isPending ? "Cancelling…" : "Cancel appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
