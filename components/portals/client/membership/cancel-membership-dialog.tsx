"use client"

import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import type { MyMembership } from "@/hooks/client/use-membership"

const date = (s: string | null) =>
  s ? format(parseISO(s), "d MMMM yyyy") : "—"

export function MembershipCancelDialog({
  membership,
  isPending,
  onConfirm,
  onKeep,
}: {
  membership: NonNullable<MyMembership["membership"]>
  isPending: boolean
  onConfirm: () => void
  onKeep: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-sm leading-relaxed text-foreground">
        Cancelling stops future payments. You keep your membership until{" "}
        <strong className="font-semibold">{date(membership.periodEnd)}</strong>.
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-destructive text-white hover:bg-destructive/90"
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending ? "Cancelling…" : "Yes, cancel"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={onKeep}
        >
          Keep membership
        </Button>
      </div>
    </div>
  )
}
