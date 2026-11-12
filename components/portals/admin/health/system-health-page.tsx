"use client"

import { format, formatDistanceToNow, parseISO } from "date-fns"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import {
  useAdminExport,
  useSystemHealth,
  type ExportKind,
} from "@/hooks/admin/use-ops"

const SEV = {
  high: {
    label: "Fix now",
    short: "High",
    cls: "bg-red-light",
    dot: "bg-rose",
    text: "text-rose",
  },
  medium: {
    label: "Look at it",
    short: "Medium",
    cls: "bg-yellow-light",
    dot: "bg-yellow",
    text: "text-yellow",
  },
  low: {
    label: "Tidy up",
    short: "Low",
    cls: "bg-blue-light",
    dot: "bg-blue",
    text: "text-blue",
  },
} as const

const SEV_ORDER: (keyof typeof SEV)[] = ["high", "medium", "low"]

const EXPORTS: { kind: ExportKind; label: string; hint: string }[] = [
  { kind: "members", label: "Members", hint: "All members + parent contact" },
  {
    kind: "enrolments",
    label: "Enrolments",
    hint: "Last 90 days",
  },
  {
    kind: "attendance",
    label: "Attendance",
    hint: "Last 90 days",
  },
  {
    kind: "payments",
    label: "Payments",
    hint: "Last 90 days",
  },
]

export function SystemHealthPage() {
  const { data, isLoading, error, refetch, isFetching } = useSystemHealth()
  const exp = useAdminExport()

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error?.message ?? "Could not load"}
      </div>
    )
  }

  const problems = data.checks.filter((c) => (c.count ?? 0) > 0)
  const unknown = data.checks.filter((c) => c.count === null)
  const healthy = data.checks.length - problems.length - unknown.length

  const bySeverity = (sev: keyof typeof SEV) =>
    problems.filter((c) => c.severity === sev)

  const totalProblems = problems.length
  const failedJobs = data.jobs.filter((j) => j.ok === false).length
  const hasAnyIssue = totalProblems > 0 || failedJobs > 0 || unknown.length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile
          label="Healthy"
          sub="checks passing"
          value={healthy}
          icon={CheckCircle2}
          accent={healthy > 0 ? "text-green" : "text-muted-foreground"}
        />
        <SummaryTile
          label="Issues"
          sub={totalProblems === 1 ? "check" : "checks"}
          value={totalProblems}
          icon={AlertTriangle}
          accent={totalProblems > 0 ? "text-rose" : "text-green"}
        />
        <SummaryTile
          label="Failed jobs"
          sub={failedJobs === 1 ? "job" : "jobs"}
          value={failedJobs}
          icon={Activity}
          accent={failedJobs > 0 ? "text-rose" : "text-green"}
        />
        <SummaryTile
          label="Unknown"
          sub="checks skipped"
          value={unknown.length}
          icon={Clock}
          accent={unknown.length > 0 ? "text-yellow" : "text-muted-foreground"}
        />
      </div>

      {/* ── Status bar ── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
          hasAnyIssue
            ? "border-border/60 bg-card"
            : "border-green/40 bg-green-light"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {!hasAnyIssue ? (
            <>
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-green"
                strokeWidth={2}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  All systems healthy
                </span>
                <span className="text-xs text-muted-foreground">
                  Checked{" "}
                  {formatDistanceToNow(parseISO(data.checked_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle
                className="h-4 w-4 shrink-0 text-rose"
                strokeWidth={2}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {totalProblems} issue{totalProblems === 1 ? "" : "s"} to
                  review
                </span>
                <span className="text-xs text-muted-foreground">
                  Checked{" "}
                  {formatDistanceToNow(parseISO(data.checked_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={isFetching}
          onClick={() => refetch()}
          className="h-8 gap-1.5 text-xs"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            strokeWidth={1.75}
          />
          {isFetching ? "Checking…" : "Check again"}
        </Button>
      </div>

      {/* ── Problems grouped by severity ── */}
      {totalProblems > 0 && (
        <div className="flex flex-col gap-5">
          {SEV_ORDER.map((sev) => {
            const items = bySeverity(sev)
            if (items.length === 0) return null
            const meta = SEV[sev]
            return (
              <section key={sev} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`}
                  />
                  <h2 className="text-[11px] font-semibold tracking-wider text-foreground uppercase">
                    {meta.label}
                  </h2>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                    {items.length}
                  </span>
                </div>

                <ul className="overflow-hidden rounded-xl border border-border/60 bg-card">
                  {items.map((c) => (
                    <li
                      key={c.code}
                      className="flex items-center gap-3 border-b border-border/60 px-4 py-3 last:border-b-0 hover:bg-accent/30"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                        {c.label}
                      </span>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-foreground uppercase ${meta.cls}`}
                        >
                          {meta.short}
                        </span>
                        <span className="min-w-8 text-right text-base font-semibold text-foreground tabular-nums">
                          {c.count}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {/* ── Unknown checks ── */}
      {unknown.length > 0 && (
        <div className="flex gap-3 rounded-xl border border-yellow/40 bg-yellow-light px-4 py-3">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-foreground"
            strokeWidth={1.75}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-medium text-foreground">
              {unknown.length} check{unknown.length === 1 ? "" : "s"} could not
              run
            </span>
            <span className="text-xs text-muted-foreground">
              A table or function they depend on may not exist yet. Add the
              missing piece or exclude the check from{" "}
              <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">
                admin_get_system_health
              </code>
              .
            </span>
            <ul className="mt-1.5 flex flex-col gap-0.5 text-xs text-muted-foreground">
              {unknown.map((c) => (
                <li key={c.code} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-yellow" />
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Scheduled jobs ── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-semibold tracking-wider text-foreground uppercase">
              Scheduled jobs
            </h2>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
              {data.jobs.length}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Last run per job
          </span>
        </div>

        {data.jobs.length === 0 ? (
          <p className="rounded-xl border border-border/60 bg-card px-4 py-6 text-center text-xs text-muted-foreground">
            No job has run yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-foreground/80 text-[10px] tracking-wider text-secondary uppercase dark:bg-foreground">
                    <th className="px-4 py-2.5 font-medium">Job</th>
                    <th className="px-4 py-2.5 font-medium">Last run</th>
                    <th className="px-4 py-2.5 font-medium">Detail</th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.jobs.map((j) => (
                    <tr
                      key={j.job}
                      className="border-b border-border/60 last:border-b-0 hover:bg-accent/30"
                    >
                      <td className="px-4 py-3 font-medium text-foreground capitalize">
                        {j.job.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                        {format(parseISO(j.started_at), "d MMM, HH:mm")}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {j.detail ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-foreground uppercase ${
                            j.ok === false
                              ? "bg-red-light"
                              : j.ok
                                ? "bg-green-light"
                                : "bg-muted"
                          }`}
                        >
                          {j.ok === false ? (
                            <>Failed</>
                          ) : j.ok ? (
                            <>
                              <CheckCircle2
                                className="h-2.5 w-2.5"
                                strokeWidth={2.5}
                              />
                              OK
                            </>
                          ) : (
                            <>
                              <Clock
                                className="h-2.5 w-2.5"
                                strokeWidth={2.5}
                              />
                              Running
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── Export ── */}
      <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-[11px] font-semibold tracking-wider text-foreground uppercase">
              Export data
            </h2>
            <p className="text-xs text-muted-foreground">
              CSV exports of operational data. Medical notes are never included,
              and every export is logged in the audit trail.
            </p>
          </div>
          <Download
            className="h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EXPORTS.map((e) => (
            <button
              key={e.kind}
              type="button"
              disabled={exp.isPending}
              onClick={() => exp.mutate({ kind: e.kind })}
              className="group flex flex-col items-start gap-0.5 rounded-lg border border-border/60 bg-background px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground">
                  {e.label}
                </span>
                <ArrowUpRight
                  className="h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                  strokeWidth={2}
                />
              </span>
              <span className="text-[10px] text-muted-foreground">
                {e.hint}
              </span>
            </button>
          ))}
        </div>

        {exp.error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {exp.error.message}
          </p>
        )}
        {exp.isSuccess && (
          <p className="flex items-center gap-1.5 text-xs text-foreground">
            <CheckCircle2
              className="h-3.5 w-3.5 shrink-0 text-green"
              strokeWidth={2}
            />
            Exported {exp.data} rows.
          </p>
        )}
      </section>
    </div>
  )
}

function SummaryTile({
  label,
  sub,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  sub: string
  value: number
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  accent: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${accent}`} strokeWidth={2} />
        <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-xl leading-none font-semibold tabular-nums ${accent}`}
        >
          {value}
        </span>
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  )
}
