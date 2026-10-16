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
  /** Optional controlled open state. When omitted, the dialog manages its own. */
  open?: boolean
  /** Optional controlled open setter. Pair with `open`. */
  onOpenChange?: (open: boolean) => void
  /**
   * When true, the built-in trigger button is not rendered.
   * Use this when an external control (e.g. a dropdown menu) opens the dialog.
   */
  hideTrigger?: boolean
}

export function ArchiveMemberDialog({
  memberName,
  isPending = false,
  onConfirm,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
}: ArchiveMemberDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled
    ? (controlledOnOpenChange ?? (() => {}))
    : setUncontrolledOpen

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
      {!hideTrigger && (
        <AlertDialogTrigger>
          <Button variant="destructive" className="w-full sm:w-auto">
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {memberName}?</AlertDialogTitle>

          <AlertDialogDescription className="flex flex-col gap-3 text-left">
            <span>
              The member will be removed from active lists and future
              appointments.
            </span>

            <span>Historical records are kept, including:</span>

            <ul className="ml-4 flex list-disc flex-col gap-1">
              <li>Attendance history</li>
              <li>Assessment results</li>
              <li>Progression records</li>
              <li>Session notes</li>
              <li>Programme history</li>
              <li>Consent records</li>
            </ul>

            <span className="font-medium text-foreground">
              You can restore the member later if needed.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isPending}
            className="text-destructive-foreground w-full bg-destructive hover:bg-destructive/90 sm:w-auto"
          >
            {isPending ? "Archiving…" : "Archive member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
