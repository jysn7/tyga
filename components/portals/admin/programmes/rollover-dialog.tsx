"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/toast"
import { useRolloverProgramme } from "@/hooks/admin/programmes/use-rollover-programme"
import type { AdminProgramme } from "@/hooks/admin/programmes/use-programmes"

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function getDefaultRolloverValues(sourceProgramme: AdminProgramme | null) {
  if (!sourceProgramme) {
    return { newName: "", newTermStart: "", newTermEnd: "" }
  }

  const sourceStart = sourceProgramme.termStart
    ? new Date(sourceProgramme.termStart)
    : new Date()
  const sourceEnd = sourceProgramme.termEnd
    ? new Date(sourceProgramme.termEnd)
    : addMonths(sourceStart, 3)

  const durationMs = sourceEnd.getTime() - sourceStart.getTime()
  const dayAfterEnd = new Date(sourceEnd)
  dayAfterEnd.setDate(dayAfterEnd.getDate() + 1)
  const newEnd = new Date(dayAfterEnd.getTime() + durationMs)

  return {
    newName: `${sourceProgramme.name} (next term)`,
    newTermStart: toISODate(dayAfterEnd),
    newTermEnd: toISODate(newEnd),
  }
}

function RolloverProgrammeDialogContent({
  sourceProgramme,
  open,
  onOpenChange,
}: {
  sourceProgramme: AdminProgramme
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const rollover = useRolloverProgramme()

  const defaults = getDefaultRolloverValues(sourceProgramme)
  const [newName, setNewName] = useState(defaults.newName)
  const [newTermStart, setNewTermStart] = useState(defaults.newTermStart)
  const [newTermEnd, setNewTermEnd] = useState(defaults.newTermEnd)
  const [copyCoaches, setCopyCoaches] = useState(true)
  const [carryStudents, setCarryStudents] = useState(true)
  const [notifyParents, setNotifyParents] = useState(false)

  // Reset mutation state when the dialog reopens
  useEffect(() => {
    if (open) {
      rollover.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isSuccess = rollover.isSuccess && rollover.data
  const isSaving = rollover.isPending

  async function handleRollover() {
    try {
      await rollover.mutateAsync({
        sourceProgrammeId: sourceProgramme.id,
        newName,
        newTermStart,
        newTermEnd,
        carryOverEnrolments: carryStudents,
        copyCoaches,
        notifyParents,
      })
      toast.add({
        title: "Programme rolled over",
        description: `${newName} is ready.`,
        type: "success",
        timeout: 5000,
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Rollover failed",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {isSuccess ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                <DialogTitle>Rollover complete</DialogTitle>
              </div>
              <DialogDescription>
                {newName} is ready.{" "}
                {carryStudents &&
                  "Returning students are now pending and will need to pay to confirm."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Next steps</p>
              <Button
                variant="outline"
                className="justify-between"
                onClick={() => {
                  onOpenChange(false)
                  router.push(
                    `/admin/programmes?tab=all&sessions=${rollover.data!.newProgrammeId}`
                  )
                }}
              >
                Generate sessions for the new term
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                className="justify-between"
                onClick={() => onOpenChange(false)}
              >
                I&apos;ll do this later
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  onOpenChange(false)
                  router.refresh()
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Roll over programme</DialogTitle>
              <DialogDescription>
                Create a new term for {sourceProgramme.name}. The current
                programme will be archived.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  New programme name
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Term starts
                  </label>
                  <Input
                    type="date"
                    value={newTermStart}
                    onChange={(e) => setNewTermStart(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Term ends
                  </label>
                  <Input
                    type="date"
                    value={newTermEnd}
                    onChange={(e) => setNewTermEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={copyCoaches}
                    onCheckedChange={(v) => setCopyCoaches(!!v)}
                  />
                  Copy coach assignments
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={carryStudents}
                    onCheckedChange={(v) => setCarryStudents(!!v)}
                  />
                  Carry forward returning students as pending enrolments
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={notifyParents}
                    onCheckedChange={(v) => setNotifyParents(!!v)}
                  />
                  Notify parents after the rollover
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleRollover} disabled={isSaving}>
                {isSaving && (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                Roll over
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function RolloverProgrammeDialog(props: {
  sourceProgramme: AdminProgramme | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!props.sourceProgramme) return null

  return (
    <RolloverProgrammeDialogContent
      key={props.sourceProgramme.id}
      sourceProgramme={props.sourceProgramme}
      open={props.open}
      onOpenChange={props.onOpenChange}
    />
  )
}
