"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
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
import {
  useBookSlot,
  type OpenSlot,
} from "@/hooks/client/use-parent-appointments"
import { useMembers } from "@/hooks/use-members"

export function BookSlotDialog({
  slot,
  open,
  onOpenChange,
}: {
  slot: OpenSlot
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [memberId, setMemberId] = useState<string>("")
  const book = useBookSlot()
  const { data: members, isLoading: membersLoading } = useMembers()

  const selectedMember = members?.find((m) => m.id === memberId)

  function handleBook() {
    if (!memberId) return
    book.mutate(
      { slotId: slot.slotId, memberId: Number(memberId) },
      {
        onSuccess: () => {
          toast.add({
            title: "Slot booked",
            description: "The academy will confirm shortly.",
            type: "success",
            timeout: 4000,
          })
          onOpenChange(false)
        },
        onError: (err) =>
          toast.add({
            title: "Failed to book",
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
          <DialogTitle>Book this slot</DialogTitle>
          <DialogDescription>
            {format(new Date(slot.startsAt), "EEE d MMM, HH:mm")} –{" "}
            {format(new Date(slot.endsAt), "HH:mm")} · {slot.venueName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Child
            </span>
            {membersLoading ? (
              <Loader />
            ) : !members || members.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                You don&apos;t have any children on your account yet.
              </p>
            ) : (
              <Select
                value={memberId}
                onValueChange={(v) => setMemberId(v ?? "")}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select a child…">
                    {selectedMember?.fullName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={book.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleBook}
            disabled={!memberId || book.isPending}
          >
            {book.isPending ? "Booking…" : "Confirm booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
