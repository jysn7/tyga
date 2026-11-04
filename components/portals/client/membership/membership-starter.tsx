"use client"

import { Button } from "@/components/ui/button"
import {
  intervalWord,
  useStartMembership,
  type MyMembership,
} from "@/hooks/client/use-membership"

const money = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n
  )

export function MembershipStarter({
  data,
  hadPrevious,
  previousEndedOn,
}: {
  data: MyMembership
  hadPrevious: boolean
  previousEndedOn: string | null
}) {
  const start = useStartMembership()

  return (
    <>
      {hadPrevious && previousEndedOn && (
        <p className="text-xs text-muted-foreground">
          Your previous membership ended on{" "}
          {new Date(previousEndedOn).toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      )}

      {data.fee.amount != null && (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-foreground tabular-nums">
            {money(data.fee.amount)}
          </span>
          <span className="text-sm text-muted-foreground">
            per {intervalWord(data.fee.interval)}
          </span>
        </div>
      )}

      {data.fee.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {data.fee.description}
        </p>
      )}

      {data.planConfigured ? (
        <Button
          variant="secondary"
          className="self-start"
          disabled={start.isPending || !data.canStart}
          onClick={() => start.mutate()}
        >
          {start.isPending
            ? "Opening payment page…"
            : hadPrevious
              ? "Rejoin membership"
              : "Start membership"}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          Membership isn&apos;t open yet. Please contact the academy.
        </p>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        You pay securely on Paystack. Your card is charged automatically each{" "}
        {intervalWord(data.fee.interval)} until you cancel.
      </p>

      {start.error && (
        <p role="alert" className="text-xs text-destructive">
          {start.error.message}
        </p>
      )}
    </>
  )
}
