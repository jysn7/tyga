"use client"

import { format, parseISO } from "date-fns"
import type { MyMembership } from "@/hooks/client/use-membership"

const money = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n
  )

const date = (s: string | null) =>
  s ? format(parseISO(s), "d MMMM yyyy") : "—"

const BADGE: Record<string, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-green-light" },
  failed: { label: "Failed", cls: "bg-red-light" },
  refunded: { label: "Refunded", cls: "bg-purple-light" },
}

export function MembershipPaymentHistory({
  charges,
}: {
  charges: MyMembership["charges"]
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">Payment history</h2>
      {charges.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No membership payments yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          {charges.map((c) => {
            const badge = BADGE[c.status] ?? {
              label: c.status,
              cls: "bg-muted",
            }
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground tabular-nums">
                    {money(c.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.status === "paid"
                      ? `Paid ${date(c.paidAt)}`
                      : c.status === "failed"
                        ? "Payment failed"
                        : "Refunded"}
                    {c.status === "paid" && c.periodEnd
                      ? ` · covers until ${date(c.periodEnd)}`
                      : ""}
                    {c.source === "manual" ? " · paid to the academy" : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-foreground ${badge.cls}`}
                >
                  {badge.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
