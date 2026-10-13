// components/portals/admin/finance/memberships-tab.tsx

"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Wallet } from "lucide-react"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { useAdminMemberships } from "@/hooks/admin/use-admin-finance"
import { MembershipBadge } from "./finance-badges"
import { MembershipFiltersBar } from "./finance-filters"

const money = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
      }).format(n)

const fmtDate = (s: string | null | undefined) =>
  s ? format(parseISO(s), "d MMM yyyy") : "—"

export function MembershipsTab() {
  const [status, setStatus] = useState<string | null>(null)
  const { data: rows = [], isLoading, error } = useAdminMemberships(status)

  return (
    <div className="flex flex-col gap-4">
      <MembershipFiltersBar status={status} onStatusChange={setStatus} />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No memberships"
          description="Monthly memberships appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/80 text-[11px] tracking-wider text-secondary uppercase dark:bg-foreground">
                  <th className="px-4 py-2.5 font-medium">Parent</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Next charge</th>
                  <th className="px-4 py-2.5 font-medium">Period ends</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="px-4 py-2">
                      <p className="text-foreground">
                        {r.account_full_name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.account_email}
                      </p>
                    </td>
                    <td className="px-4 py-2">
                      <MembershipBadge status={r.status} />
                    </td>
                    <td className="px-4 py-2 text-foreground">
                      {money(r.amount)}{" "}
                      <span className="text-xs text-muted-foreground">
                        / {r.interval}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {fmtDate(r.next_charge_at)}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {fmtDate(r.current_period_end)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
