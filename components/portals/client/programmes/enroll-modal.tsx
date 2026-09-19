"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useEnrollableMembers } from "@/hooks/client/use-programmes"
import { useEnroll } from "@/hooks/client/use-enroll"
import { toast } from "@/components/ui/toast"
import {
  GraduationCap,
  MapPin,
  CalendarDays,
  Check,
  AlertCircle,
} from "lucide-react"
import type { ProgrammeListItem } from "@/lib/types"

export function EnrollModal({
  programme,
  open,
  onOpenChange,
}: {
  programme: ProgrammeListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")

  const programmeId = programme ? Number(programme.id) : 0
  const { data: members, isLoading } = useEnrollableMembers(programmeId)
  const enroll = useEnroll()

  const eligible = (members ?? []).filter((m) => m.isEligible)
  const ineligible = (members ?? []).filter((m) => !m.isEligible)

  async function handleEnroll() {
    if (!selectedMemberId || !programme) return

    try {
      const { authorization_url } = await enroll.mutateAsync({
        memberId: Number(selectedMemberId),
        programmeId: Number(programme.id),
      })
      window.location.href = authorization_url
    } catch (err) {
      toast.add({
        title: "Could not start enrollment",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:w-full sm:max-w-md [&>button]:top-6 [&>button]:right-6 [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
        {programme && (
          <>
            <DialogHeader className="flex shrink-0 flex-row items-center gap-3.5 space-y-0 p-0 pb-6 text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
                <GraduationCap
                  className="h-4.5 w-4.5 text-foreground"
                  strokeWidth={1.75}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground">
                  Enrol
                </DialogTitle>
                <span className="truncate text-xs text-muted-foreground">
                  {programme.name}
                </span>
              </div>
            </DialogHeader>

            {/* Scrollable body */}
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
              {/* Child picker */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Which child?
                </span>

                {isLoading ? (
                  <div className="flex flex-col gap-2">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="h-12 animate-pulse rounded-xl bg-input"
                      />
                    ))}
                  </div>
                ) : !members || members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No members available to enroll.
                  </p>
                ) : eligible.length === 0 ? (
                  <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
                    <AlertCircle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
                      strokeWidth={1.75}
                    />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      None of your children are eligible for this programme.
                    </p>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedMemberId}
                    onValueChange={setSelectedMemberId}
                    className="flex flex-col gap-2"
                  >
                    {eligible.map((m) => {
                      const id = `m-${m.id}`
                      const isSelected = selectedMemberId === m.id.toString()
                      return (
                        <label
                          key={m.id}
                          htmlFor={id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                            isSelected
                              ? "border-primary/60 bg-primary/5"
                              : "border-border/60 hover:bg-accent/40"
                          }`}
                        >
                          <RadioGroupItem value={m.id.toString()} id={id} />
                          <span className="flex-1 truncate text-sm font-medium text-foreground">
                            {m.fullName}
                          </span>
                          {isSelected && (
                            <Check
                              className="h-3.5 w-3.5 shrink-0 text-primary"
                              strokeWidth={2}
                            />
                          )}
                        </label>
                      )
                    })}
                  </RadioGroup>
                )}
              </div>

              {/* Ineligible */}
              {ineligible.length > 0 && (
                <details className="group rounded-xl border border-border/60 bg-muted/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                    <span>
                      {ineligible.length} ineligible{" "}
                      {ineligible.length === 1 ? "member" : "members"}
                    </span>
                    <span className="text-[10px] transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <ul className="flex flex-col gap-2 border-t border-border/60 px-3.5 py-3">
                    {ineligible.map((m) => (
                      <li key={m.id} className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground">
                          {m.fullName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {m.reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              <div className="h-px bg-border/60" />

              {/* Programme meta */}
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="text-muted-foreground">Venue</span>
                  <span className="ml-auto text-right text-foreground">
                    {programme.venueName ?? "—"}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CalendarDays
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="ml-auto text-right leading-tight text-foreground">
                    {programme.recurrenceRule ?? "—"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {/* Total */}
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Total due
                </span>
                <span className="text-xl font-semibold tracking-tight text-foreground">
                  R{programme.price ?? 0}
                </span>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="mt-6 flex shrink-0 flex-col gap-2 p-0 sm:flex-col">
              <Button
                className="h-11 w-full text-sm"
                disabled={!selectedMemberId || enroll.isPending}
                onClick={handleEnroll}
              >
                {enroll.isPending
                  ? "Redirecting to payment…"
                  : `Enrol & pay R${programme.price ?? 0}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
