"use client"

import { useState, type ReactNode, type ReactElement } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, CheckCircle2, LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  WITHDRAW_REASONS,
  useWithdrawEnrollment,
  type WithdrawReason,
  type WithdrawResult,
} from "@/hooks/client/use-withdraw-enrollment"

function useCancellationPolicy(enabled: boolean) {
  return useQuery({
    queryKey: ["app-settings", "cancellation-policy"],
    enabled,
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("app_settings")
        .select("cancellation_policy_text, support_email, support_phone")
        .eq("id", 1)
        .maybeSingle()
      return data
    },
  })
}

type Step = "confirm" | "reason"

export function WithdrawEnrollmentDialog({
  enrollmentId,
  memberName,
  programmeName,
  status,
  trigger,
}: {
  enrollmentId: number
  memberName: string
  programmeName: string
  status: string
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("confirm")
  const [reason, setReason] = useState<WithdrawReason | null>(null)
  const [note, setNote] = useState("")
  const [result, setResult] = useState<WithdrawResult | null>(null)
  const withdraw = useWithdrawEnrollment()
  const { data: policy } = useCancellationPolicy(open)

  const isPending = status === "pending"
  const verb = isPending ? "Cancel enrolment" : "Withdraw"
  const noteRequired = reason === "other"
  const canSubmit =
    !!reason && (!noteRequired || note.trim().length > 0) && !withdraw.isPending

  function closeDialog() {
    setOpen(false)
    setStep("confirm")
    setReason(null)
    setNote("")
    setResult(null)
    withdraw.reset()
  }

  function submit() {
    if (!reason) return
    withdraw.mutate(
      { enrollmentId, reason, note },
      { onSuccess: (r) => setResult(r) }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // While the success state is showing, don't let Radix close the
        // dialog on its own (e.g. on focus loss, escape, or an outside
        // click that happens right after the mutation resolves). Only
        // the explicit "Done" button should dismiss it.
        if (result) return
        if (next) setOpen(true)
        else closeDialog()
      }}
    >
      <DialogTrigger render={trigger as ReactElement} />

      <DialogContent className="sm:max-w-lg">
        {result ? (
          /* ---------- Success state ---------- */
          <>
            <DialogHeader className="items-center text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-light">
                <CheckCircle2
                  className="h-5 w-5 text-primary"
                  strokeWidth={1.75}
                />
              </div>
              <DialogTitle className="mt-2">
                {isPending ? "Enrolment cancelled" : "Withdrawn"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {memberName} is no longer enrolled in {programmeName}.
                {result.refund_review &&
                  " Because this enrolment was paid, the academy will review whether a refund applies and be in touch."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={closeDialog}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        ) : step === "confirm" ? (
          /* ---------- Step 1: Confirm ---------- */
          <>
            <DialogHeader>
              <DialogTitle className="text-base">
                {verb} {memberName}?
              </DialogTitle>
              <DialogDescription className="text-sm">
                {programmeName}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              {/* Consequence note — no box, just icon + text */}
              <div className="flex gap-2.5">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-orange"
                  strokeWidth={1.75}
                />
                <div className="flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
                  {isPending ? (
                    <>
                      <span>
                        Your unpaid invoice for this programme will be
                        cancelled.
                      </span>
                      <span>
                        You can enrol again later if places are available.
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {memberName} is removed from all upcoming sessions and
                        their place is released.
                      </span>
                      <span>
                        Attendance and progress already recorded are kept.
                      </span>
                      <span>
                        If you have already paid, the academy will review
                        whether a refund applies. A refund is not automatic.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Cancellation policy — collapsible, no box */}
              {policy?.cancellation_policy_text && (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                    <span className="transition-transform group-open:rotate-90">
                      ›
                    </span>
                    <span>Read the cancellation policy</span>
                  </summary>
                  <p className="mt-2 pl-3.5 text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {policy.cancellation_policy_text}
                  </p>
                </details>
              )}

              {(policy?.support_email || policy?.support_phone) && (
                <p className="text-xs text-muted-foreground">
                  Questions?{" "}
                  {[policy.support_email, policy.support_phone]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Keep enrolment
              </Button>
              <Button
                variant="destructive"
                onClick={() => setStep("reason")}
                className="gap-1.5"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* ---------- Step 2: Reason ---------- */
          <>
            <DialogHeader>
              <DialogTitle className="text-base">
                Why are you leaving?
              </DialogTitle>
              <DialogDescription className="text-sm">
                Your feedback helps us improve. This is required.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              {/* Reason picker */}
              <div
                role="radiogroup"
                aria-label="Reason"
                className="flex flex-col gap-2"
              >
                {WITHDRAW_REASONS.map((r) => {
                  const selected = reason === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setReason(r.value)}
                      className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-xs transition-colors ${
                        selected
                          ? "border-primary text-foreground"
                          : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          selected ? "border-primary" : "border-border"
                        }`}
                      >
                        {selected && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </span>
                      {r.label}
                    </button>
                  )
                })}
              </div>

              {/* Note */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">
                  {noteRequired
                    ? "Please tell us more — required"
                    : "Anything else? — optional"}
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder={
                    noteRequired ? "A few words help us improve…" : "Optional"
                  }
                  className="min-h-20 resize-none rounded-lg border border-border bg-input px-3 py-2 text-xs text-foreground outline-none focus-visible:border-primary"
                />
              </div>

              {withdraw.error && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {withdraw.error.message}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                disabled={withdraw.isPending}
                onClick={() => setStep("confirm")}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                disabled={!canSubmit}
                onClick={submit}
                className="gap-1.5"
              >
                {withdraw.isPending ? (
                  "Saving…"
                ) : (
                  <>
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    {verb}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
