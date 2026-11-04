"use client"

import { format, parseISO } from "date-fns"
import { CheckCircle2 } from "lucide-react"
import { intervalWord, type MyMembership } from "@/hooks/client/use-membership"

const money = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n
  )

const date = (s: string | null) =>
  s ? format(parseISO(s), "d MMMM yyyy") : "—"

export function MembershipActiveState({
  membership,
}: {
  membership: NonNullable<MyMembership["membership"]>
}) {
  const isPending = membership.status === "pending"

  return (
    <>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-foreground tabular-nums">
          {money(membership.amount)}
        </span>
        <span className="text-sm text-muted-foreground">
          per {intervalWord(membership.interval)}
        </span>
      </div>
      <p className="flex items-center gap-2 text-sm text-foreground">
        <CheckCircle2 className="h-4 w-4 text-green" strokeWidth={1.75} />
        {isPending
          ? "Waiting for the first payment to clear"
          : `Next payment on ${date(membership.nextChargeAt ?? membership.periodEnd)}`}
      </p>
    </>
  )
}
