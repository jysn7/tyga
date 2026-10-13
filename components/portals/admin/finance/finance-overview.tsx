"use client"

import { Loader } from "@/components/portals/shared/loader"
import { useFinanceOverview } from "@/hooks/admin/use-admin-finance"

const money = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
      }).format(n)

type TabKey = "overview" | "invoices" | "payments" | "refunds" | "memberships"

function Tile({
  label,
  value,
  sub,
  tint,
  onClick,
}: {
  label: string
  value: string
  sub?: string
  tint: string
  onClick?: () => void
}) {
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      onClick={onClick}
      className={`rounded-2xl p-4 text-left ${tint} ${onClick ? "transition-shadow hover:shadow" : ""}`}
    >
      <p className="text-xl leading-none font-semibold text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </Comp>
  )
}

export function FinanceOverviewTab({ goTo }: { goTo: (t: TabKey) => void }) {
  const { data, isLoading, error } = useFinanceOverview()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error?.message ?? "Could not load the overview"}
      </div>
    )
  }

  const delta =
    data.revenue_last_month > 0
      ? Math.round(
          ((data.revenue_this_month - data.revenue_last_month) /
            data.revenue_last_month) *
            100
        )
      : null
  const max = Math.max(1, ...data.revenue_by_month.map((m) => m.revenue))
  const typeMax = Math.max(
    1,
    ...data.revenue_by_programme_type.map((t) => t.revenue)
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Tile
          label="Received this month"
          value={money(data.revenue_this_month)}
          sub={
            delta === null
              ? `${data.payments_this_month} payments`
              : `${delta >= 0 ? "+" : ""}${delta}% vs last month`
          }
          tint="bg-green-light"
        />
        <Tile
          label="Outstanding"
          value={money(data.outstanding_amount)}
          sub={`${data.outstanding_count} unpaid invoices`}
          tint="bg-yellow-light"
          onClick={() => goTo("invoices")}
        />
        <Tile
          label="Overdue"
          value={money(data.overdue_amount)}
          sub={`${data.overdue_count} invoices`}
          tint="bg-red-light"
          onClick={() => goTo("invoices")}
        />
        <Tile
          label="On hold (paused enrolments)"
          value={money(data.on_hold_amount)}
          sub={`${data.on_hold_count} invoices`}
          tint="bg-blue-light"
        />
        <Tile
          label="Refunds waiting"
          value={String(data.refund_reviews)}
          sub={data.refund_reviews ? "Needs a decision" : "All clear"}
          tint="bg-orange-light"
          onClick={() => goTo("refunds")}
        />
        <Tile
          label="Active memberships"
          value={String(data.memberships.active)}
          sub={`${money(data.memberships.monthly_value)} a month expected${data.memberships.attention ? ` · ${data.memberships.attention} need attention` : ""}`}
          tint="bg-purple-light"
          onClick={() => goTo("memberships")}
        />
      </div>

      <div className="rounded-2xl bg-card p-5 shadow">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Received per month
        </h2>
        <div className="mt-4 flex h-44 items-end gap-2">
          {data.revenue_by_month.map((m) => (
            <div
              key={m.month_start}
              title={`${m.label}: ${money(m.revenue)}`}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <div
                className="w-full rounded-t bg-primary"
                style={{
                  height: `${(m.revenue / max) * 100}%`,
                  minHeight: m.revenue > 0 ? 4 : 0,
                }}
              />
              <span className="text-[10px] text-muted-foreground">
                {m.label.slice(0, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {data.revenue_by_programme_type.length > 0 && (
        <div className="rounded-2xl bg-card p-5 shadow">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Programme income by type
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {data.revenue_by_programme_type.map((t) => (
              <div key={t.programme_type} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="capitalize">
                    {t.programme_type?.replace(/_/g, " ")}
                  </span>
                  <span>{money(t.revenue)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(t.revenue / typeMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
