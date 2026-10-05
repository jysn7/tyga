"use client"

import { useState } from "react"
import { Archive } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ArchiveMemberDialogProps = {
  memberName: string
  isPending?: boolean
  onConfirm: () => Promise<void>
}

export function ArchiveMemberDialog({
  memberName,
  isPending = false,
  onConfirm,
}: ArchiveMemberDialogProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = async () => {
    const toastId = "archive-member-status"

    toast.add({
      id: toastId,
      title: "Archiving member...",
      description: "Please wait",
      type: "loading",
      timeout: 0,
    })

    try {
      await onConfirm()

      toast.add({
        id: toastId,
        title: "Member archived",
        description: `${memberName} has been archived successfully.`,
        type: "success",
        timeout: 5000,
      })

      setOpen(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong"

      toast.add({
        id: toastId,
        title: "Archive failed",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Button variant="destructive" className="w-full sm:w-auto">
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {memberName}?</AlertDialogTitle>

          <AlertDialogDescription className="space-y-3 text-left">
            <p>
              This member will be removed from active lists and future
              appointments.
            </p>

            <p>Historical records will be preserved, including:</p>

            <ul className="ml-4 list-disc space-y-1">
              <li>Attendance history</li>
              <li>Assessment results</li>
              <li>Progression records</li>
              <li>Session notes</li>
              <li>Programme history</li>
              <li>Consent records</li>
            </ul>

            <p className="font-medium text-foreground">
              This action can be reversed later by restoring the member.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="text-destructive-foreground w-full bg-destructive hover:bg-destructive/90 sm:w-auto"
          >
            {isPending ? "Archiving..." : "Archive Member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
