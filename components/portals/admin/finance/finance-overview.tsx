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

type TabKey =
  "overview" | "invoices" | "payments" | "refunds" | "donations" | "memberships"

// ============================================================
// Tile
// ============================================================

function Tile({
  label,
  value,
  sub,
  accent,
  spark,
  onClick,
}: {
  label: string
  value: string
  sub?: string
  accent: string
  spark?: number[]
  onClick?: () => void
}) {
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      onClick={onClick}
      className={`flex flex-col rounded-2xl border border-border/60 bg-card p-4 text-left ${
        onClick ? "transition-colors hover:bg-accent" : ""
      }`}
    >
      <p
        className={`text-xl leading-none font-semibold tabular-nums ${accent}`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
      {spark && spark.length > 1 && (
        <Sparkline data={spark} className={`mt-3 ${accent}`} />
      )}
    </Comp>
  )
}

// ============================================================
// Sparkline — inline SVG, inherits stroke from parent via currentColor
// ============================================================

function Sparkline({
  data,
  className,
}: {
  data: number[]
  className?: string
}) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`
    )
    .join(" ")
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`h-6 w-full ${className}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

// ============================================================
// Palette rotation for programme-type bars
// Chart slots first (they're designed for data viz), then
// semantic palette for overflow.
// ============================================================

const TYPE_COLORS = [
  "bg-(--chart-1)",
  "bg-(--chart-2)",
  "bg-(--chart-3)",
  "bg-(--chart-4)",
  "bg-(--chart-5)",
  "bg-blue",
  "bg-teal",
  "bg-purple",
  "bg-orange",
  "bg-pink",
]

const TYPE_COLORS_FOREGROUND = [
  "text-(--chart-1)",
  "text-(--chart-2)",
  "text-(--chart-3)",
  "text-(--chart-4)",
  "text-(--chart-5)",
  "text-blue",
  "text-teal",
  "text-purple",
  "text-orange",
  "text-pink",
]

// ============================================================
// Main
// ============================================================

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
  const revenueSpark = data.revenue_by_month.map((m) => m.revenue)

  return (
    <div className="flex flex-col gap-6">
      {/* ============ Tiles ============ */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Tile
          label="Received this month"
          value={money(data.revenue_this_month)}
          sub={
            delta === null
              ? `${data.payments_this_month} payments`
              : `${delta >= 0 ? "+" : ""}${delta}% vs last month`
          }
          accent={delta !== null && delta < 0 ? "text-rose" : "text-green"}
          spark={revenueSpark}
        />
        <Tile
          label="Outstanding"
          value={money(data.outstanding_amount)}
          sub={`${data.outstanding_count} unpaid invoices`}
          accent="text-yellow"
          onClick={() => goTo("invoices")}
        />
        <Tile
          label="Overdue"
          value={money(data.overdue_amount)}
          sub={`${data.overdue_count} invoices`}
          accent="text-red"
          onClick={() => goTo("invoices")}
        />
        <Tile
          label="On hold (paused enrolments)"
          value={money(data.on_hold_amount)}
          sub={`${data.on_hold_count} invoices`}
          accent="text-blue"
        />
        <Tile
          label="Refunds waiting"
          value={String(data.refund_reviews)}
          sub={data.refund_reviews ? "Needs a decision" : "All clear"}
          accent="text-orange"
          onClick={() => goTo("refunds")}
        />
        <Tile
          label="Active memberships"
          value={String(data.memberships.active)}
          sub={`${money(data.memberships.monthly_value)} a month expected${
            data.memberships.attention
              ? ` · ${data.memberships.attention} need attention`
              : ""
          }`}
          accent="text-purple"
          onClick={() => goTo("memberships")}
        />
      </div>

      {/* ============ Monthly revenue ============ */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Received per month
          </h2>
          <span className="text-xs text-muted-foreground">
            Last {data.revenue_by_month.length} months
          </span>
        </div>

        <div className="mt-6 flex h-48 items-end gap-3">
          {data.revenue_by_month.map((m, i) => {
            const isCurrent = i === data.revenue_by_month.length - 1
            const fill = isCurrent ? "bg-teal" : "bg-(--chart-1)"
            return (
              <div
                key={m.month_start}
                title={`${m.label}: ${money(m.revenue)}`}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              >
                <span className="text-[10px] font-medium text-muted-foreground tabular-nums opacity-0 transition-opacity group-hover:opacity-100">
                  {money(m.revenue)}
                </span>
                <div
                  className={`w-full rounded-t-md ${fill} transition-all group-hover:opacity-80`}
                  style={{
                    height: `${(m.revenue / max) * 100}%`,
                    minHeight: m.revenue > 0 ? 4 : 0,
                  }}
                />
                <span
                  className={`text-[10px] ${
                    isCurrent
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {m.label.slice(0, 3)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 flex items-center gap-4 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-(--chart-1)" />
            Historical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal" />
            Current month
          </span>
        </div>
      </div>

      {/* ============ Programme income by type ============ */}
      {data.revenue_by_programme_type.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Programme income by type
            </h2>
            <span className="text-xs text-muted-foreground">
              {data.revenue_by_programme_type.length} type
              {data.revenue_by_programme_type.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3.5">
            {data.revenue_by_programme_type.map((t, i) => {
              const bgClass = TYPE_COLORS[i % TYPE_COLORS.length]
              const fgClass =
                TYPE_COLORS_FOREGROUND[i % TYPE_COLORS_FOREGROUND.length]
              const pct = Math.round((t.revenue / typeMax) * 100)
              return (
                <div key={t.programme_type} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="flex items-center gap-2 text-foreground capitalize">
                      <span className={`h-2 w-2 rounded-full ${bgClass}`} />
                      {t.programme_type?.replace(/_/g, " ") ?? "Uncategorised"}
                    </span>
                    <span className="flex items-baseline gap-2">
                      <span className={`text-[10px] tabular-nums ${fgClass}`}>
                        {pct}%
                      </span>
                      <span className="text-foreground tabular-nums">
                        {money(t.revenue)}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${bgClass} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
