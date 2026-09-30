"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  useCoachSlots,
  useArchiveAppointmentSlot,
  type CoachSlot,
} from "@/hooks/coach/use-coach-appointments"
import { SlotRow } from "./slot-row"
import { OpenSlotDialog } from "@/components/portals/Coach/appointments/open-slot-dialog"

export function MyAvailabilityTab() {
  const [showArchived, setShowArchived] = useState(false)
  const { data: slots, isLoading, error } = useCoachSlots(showArchived)
  const [openDialog, setOpenDialog] = useState(false)
  const [archiving, setArchiving] = useState<CoachSlot | null>(null)
  const archive = useArchiveAppointmentSlot()

  function handleArchive(slot: CoachSlot) {
    archive.mutate(slot.id, {
      onSuccess: () => {
        toast.add({ title: "Slot archived", type: "success", timeout: 3000 })
        setArchiving(null)
      },
      onError: (err) =>
        toast.add({
          title: "Failed to archive",
          description:
            err instanceof Error ? err.message : "Something went wrong",
          type: "error",
          timeout: 5000,
        }),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          Show archived
        </label>

        <Button onClick={() => setOpenDialog(true)} className="h-9 text-xs">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Open a slot
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      ) : !slots || slots.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No slots yet"
          description="Open a slot to let parents book you."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="flex flex-col divide-y divide-border/60">
            {slots.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                onArchive={() => setArchiving(slot)}
              />
            ))}
          </div>
        </div>
      )}

      <OpenSlotDialog open={openDialog} onOpenChange={setOpenDialog} />

      {archiving && (
        <Dialog
          open={true}
          onOpenChange={(open) => !open && setArchiving(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Archive this slot?</DialogTitle>
              <DialogDescription>
                {format(new Date(archiving.startsAt), "EEE d MMM, HH:mm")} –{" "}
                {format(new Date(archiving.endsAt), "HH:mm")} ·{" "}
                {archiving.venueName}
              </DialogDescription>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">
              Parents will no longer be able to book this slot.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setArchiving(null)}
                disabled={archive.isPending}
              >
                Keep it
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleArchive(archiving)}
                disabled={archive.isPending}
              >
                {archive.isPending ? "Archiving…" : "Archive"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
