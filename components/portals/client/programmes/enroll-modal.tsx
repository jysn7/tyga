"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { useEnrollableMembers } from "@/hooks/client/use-programmes"
import { useEnroll } from "@/hooks/client/use-enroll"
import { toast } from "@/components/ui/toast"
import { AlertCircle } from "lucide-react"
import type { ProgrammeListItem } from "@/lib/types"

const money = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 0,
      }).format(n)

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
  const hasEligible = eligible.length > 0

  const selectedMember = eligible.find(
    (m) => m.id.toString() === selectedMemberId
  )
  const price = programme?.price ?? 0

  function handleEnroll() {
    if (!selectedMemberId || !programme) return
    enroll.mutate(
      {
        memberId: Number(selectedMemberId),
        programmeId: Number(programme.id),
      },
      {
        onSuccess: ({ authorization_url }) => {
          window.location.href = authorization_url
        },
        onError: (err) =>
          toast.add({
            title: "Could not start enrollment",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  if (!programme) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enrol</DialogTitle>
          <DialogDescription>
            {programme.name}
            {programme.venueName ? ` · ${programme.venueName}` : ""}
            {programme.recurrenceRule ? ` · ${programme.recurrenceRule}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Child
            </span>
            {isLoading ? (
              <Loader />
            ) : !members || members.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                You don&apos;t have any members on your account yet.
              </p>
            ) : !hasEligible ? (
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
              <Select
                value={selectedMemberId}
                onValueChange={(v) => setSelectedMemberId(v ?? "")}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select a child…">
                    {selectedMember?.fullName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {eligible.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

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

          <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Total due
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {money(price)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={enroll.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleEnroll}
            disabled={!selectedMemberId || enroll.isPending}
          >
            {enroll.isPending ? "Redirecting…" : `Enrol & pay ${money(price)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
