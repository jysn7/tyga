"use client"

import {
  Users,
  UserCog,
  GraduationCap,
  Receipt,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  useOverviewStats,
  useEnrollmentTrend,
  useMembersByLevel,
  useRecentActivity,
} from "@/hooks/admin/use-admin-overview"
import { Loader } from "@/components/portals/shared/loader"

const STAT_ICONS = [Users, GraduationCap, UserCog, Receipt]

const quickLinks = [
  { label: "Accounts", href: "/admin/accounts", icon: Users },
  { label: "Members", href: "/admin/members", icon: GraduationCap },
  { label: "Coaches", href: "/admin/coaches", icon: UserCog },
  { label: "Audit Log", href: "/admin/audit", icon: TrendingUp },
]

function StatTile({
  label,
  value,
  delta,
  trend,
  icon: Icon,
}: {
  label: string
  value: string
  delta: string
  trend: "up" | "down"
  icon: React.ElementType
}) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl bg-card p-4 shadow">
      <div className="relative flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
          <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-primary" : "text-destructive"}`}
        >
          <TrendIcon className="h-3 w-3" />
          {delta}
        </div>
      </div>
      <div className="relative flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

type ChartTooltipProps = {
  active?: boolean
  payload?: Array<{ value?: number | string | null }>
  label?: string | number
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-0.5 font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          {typeof entry.value === "number"
            ? entry.value.toLocaleString()
            : entry.value}
        </p>
      ))}
    </div>
  )
}

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = useOverviewStats()
  const { data: enrollmentTrend, isLoading: trendLoading } =
    useEnrollmentTrend()
  const { data: membersByLevel, isLoading: levelLoading } = useMembersByLevel()
  const { data: recentActivity, isLoading: activityLoading } =
    useRecentActivity()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Snapshot of TYGA across accounts, programmes, and revenue
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading || !stats
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex h-28 items-center justify-center rounded-xl bg-muted/60"
              >
                <Loader />
              </div>
            ))
          : stats.map((s, i) => (
              <StatTile key={s.label} {...s} icon={STAT_ICONS[i]} />
            ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow lg:col-span-2">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-medium text-foreground">
              Enrollments over time
            </h2>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </div>
          <div className="h-64 w-full">
            {trendLoading || !enrollmentTrend ? (
              <div className="flex h-full items-center justify-center">
                <Loader />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={enrollmentTrend}
                  margin={{ left: -20, right: 8, top: 8 }}
                >
                  <defs>
                    <linearGradient
                      id="enrollmentFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeOpacity={0.6}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    width={32}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: "var(--border)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#enrollmentFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-medium text-foreground">
              Members by level
            </h2>
            <p className="text-xs text-muted-foreground">
              Current distribution
            </p>
          </div>
          <div className="h-64 w-full">
            {levelLoading || !membersByLevel ? (
              <div className="flex h-full items-center justify-center">
                <Loader />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={membersByLevel}
                  layout="vertical"
                  margin={{ left: 0, right: 8 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="var(--border)"
                    strokeOpacity={0.6}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="level"
                    axisLine={false}
                    tickLine={false}
                    width={90}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "var(--accent)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[0, 4, 4, 0]}
                    barSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-1 lg:col-span-2">
          <h2 className="px-1 pb-2 text-sm font-medium text-foreground">
            Recent activity
          </h2>
          {activityLoading || !recentActivity ? (
            <div className="flex h-32 items-center justify-center rounded-xl bg-card">
              <Loader />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl bg-card text-sm text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/60 rounded-xl bg-card p-3 shadow">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background">
                    <item.icon
                      className="h-3.5 w-3.5 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="px-1 pb-2 text-sm font-medium text-foreground">
            Quick links
          </h2>
          <div className="flex flex-col gap-1.5">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-xl bg-card px-3.5 py-3 shadow transition-colors hover:bg-accent/60"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
                  <link.icon
                    className="h-4 w-4 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <span className="flex-1 text-sm text-foreground">
                  {link.label}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
