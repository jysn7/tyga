"use client"

import { useState } from "react"
import { ShieldAlert } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field } from "@/components/portals/shared/field"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const REASONS = [
  "Enrolment review",
  "Medical emergency",
  "Coaching check-in",
  "Compliance audit",
  "Other (specify below)",
] as const

export function SensitiveAccessModal({
  memberName,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  memberName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  isPending: boolean
}) {
  const [selected, setSelected] = useState<string>("")
  const [customReason, setCustomReason] = useState("")

  const needsCustom = selected === "Other (specify below)"
  const finalReason = needsCustom ? customReason.trim() : selected

  const canSubmit = finalReason.length >= 3 && !isPending

  function handleConfirm() {
    if (!canSubmit) return
    onConfirm(finalReason)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full gap-0 overflow-hidden rounded-xl border-0 bg-secondary p-6 ring-0 sm:max-w-md [&>button]:top-5 [&>button]:right-5 [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
        <DialogHeader className="flex flex-row items-center gap-3.5 space-y-0 p-0 pb-6 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
            <ShieldAlert
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground">
              Sensitive data access
            </DialogTitle>
            <span className="truncate text-xs text-muted-foreground">
              {memberName}
            </span>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            You&apos;re about to view sensitive information for this member
            (medical notes, date of birth, emergency contact). This access will
            be logged against your account with the reason you provide.
          </p>

          <Field label="Reason for access" required>
            <div className="flex flex-col gap-1.5">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg p-2.5 text-xs transition-colors ${
                    selected === r
                      ? "bg-card text-foreground"
                      : "text-muted-foreground hover:bg-accent/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={selected === r}
                    onChange={() => setSelected(r)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border ${
                      selected === r
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {selected === r && (
                      <span className="h-1 w-1 rounded-full bg-primary-foreground" />
                    )}
                  </span>
                  {r}
                </label>
              ))}
            </div>
          </Field>

          {needsCustom && (
            <Field label="Details" required>
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Briefly describe why you need to view this data"
                className="min-h-20 resize-none rounded-lg border-0 bg-input p-3 text-sm ring-0 focus-visible:ring-0"
              />
            </Field>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2 p-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-0 bg-input hover:bg-accent"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit}>
            {isPending ? "Logging…" : "Log & view"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
