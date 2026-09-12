// components/portals/admin/coaches/invite-coach-dialog.tsx
"use client"

import { useState } from "react"
import { Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import {
  useInviteCoach,
  type InviteCoachInput,
} from "@/hooks/admin/invites/use-invite-coach"

const COACH_TYPE_OPTIONS: {
  label: string
  value: NonNullable<InviteCoachInput["coachType"]>
}[] = [
  { label: "Head coach", value: "head_coach" },
  { label: "Assistant", value: "assistant_coach" },
  { label: "Volunteer", value: "volunteer" },
]

export function InviteCoachModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [email, setEmail] = useState("")
  const [coachType, setCoachType] = useState("")
  const [maxRatio, setMaxRatio] = useState("")

  const inviteCoach = useInviteCoach()

  function reset() {
    setEmail("")
    setCoachType("")
    setMaxRatio("")
  }

  async function handleSubmit() {
    try {
      await inviteCoach.mutateAsync({
        email,
        coachType: coachType
          ? (coachType as InviteCoachInput["coachType"])
          : undefined,
        maxStudentRatio: maxRatio ? Number(maxRatio) : undefined,
      })

      toast.add({
        title: "Invite sent",
        description: `An invite email was sent to ${email}.`,
        type: "success",
        timeout: 4000,
      })

      reset()
      onOpenChange(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to send invite",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  const canSubmit = /\S+@\S+\.\S+/.test(email)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-xl [&>button]:top-6 [&>button]:right-6 [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
        <DialogHeader className="flex flex-row items-center gap-3.5 space-y-0 p-0 pb-6 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
            <Mail className="h-4.5 w-4.5 text-foreground" strokeWidth={1.75} />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground">
              Invite coach
            </DialogTitle>
            <span className="truncate text-xs text-muted-foreground">
              Send an email invite to join as a coach
            </span>
          </div>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Email address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coach@example.com"
              autoComplete="off"
              autoFocus
              className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Coach type (optional)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {COACH_TYPE_OPTIONS.map((opt) => {
                const isSelected = coachType === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCoachType(isSelected ? "" : opt.value)}
                    className={`rounded-lg px-3 py-2.5 text-center text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <span className="text-xs text-muted-foreground">
              Can be set later if unsure
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Max student ratio (optional)
            </label>
            <Input
              type="number"
              min={1}
              value={maxRatio}
              onChange={(e) => setMaxRatio(e.target.value)}
              placeholder="e.g. 8"
              className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <DialogFooter className="mt-8 flex flex-row items-center justify-between gap-3 p-0 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={!canSubmit || inviteCoach.isPending}
            onClick={handleSubmit}
          >
            {inviteCoach.isPending ? "Sending..." : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
