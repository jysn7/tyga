"use client"

import {
  Calendar,
  Users,
  TrendingUp,
  MapPin,
  ChevronRight,
  Star,
  CheckCircle2,
  GraduationCap,
} from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Button } from "@/components/ui/button"

// ============================================================
// Sample data — swap for real hooks later
// ============================================================

const coach = { name: "Lindiwe", greeting: "Good morning" }

const stats = [
  {
    label: "Today's sessions",
    value: "4",
    icon: Calendar,
    color: "primary" as const,
  },
  {
    label: "Active students",
    value: "28",
    icon: Users,
    color: "blue" as const,
  },
  {
    label: "Assessments due",
    value: "3",
    icon: GraduationCap,
    color: "pink" as const,
  },
  {
    label: "Avg. attendance",
    value: "94%",
    icon: TrendingUp,
    color: "orange" as const,
  },
]

const todaySchedule = [
  {
    id: "1",
    time: "8:00 AM",
    programme: "Foundation Group A",
    venue: "Soweto Country Club",
    students: 6,
    status: "upcoming" as const,
  },
  {
    id: "2",
    time: "10:30 AM",
    programme: "Skill Building",
    venue: "Driving Range",
    students: 4,
    status: "upcoming" as const,
  },
  {
    id: "3",
    time: "1:00 PM",
    programme: "1-on-1: Thabo M.",
    venue: "Practice Ground",
    students: 1,
    status: "upcoming" as const,
  },
  {
    id: "4",
    time: "3:30 PM",
    programme: "Performance Squad",
    venue: "Soweto Country Club",
    students: 8,
    status: "upcoming" as const,
  },
]

const pendingAssessments = [
  { id: "1", name: "Amara Ndlovu", currentLevel: "Foundation", age: 11 },
  { id: "2", name: "Kagiso Sithole", currentLevel: "Skill Building", age: 13 },
  { id: "3", name: "Zanele Mokoena", currentLevel: null, age: 9 },
]

const recentProgress = [
  {
    id: "1",
    name: "Thabo Mahlangu",
    milestone: "Completed short-game module",
    time: "2h ago",
  },
  {
    id: "2",
    name: "Priya Naidoo",
    milestone: "Moved up to Skill Building",
    time: "Yesterday",
  },
  {
    id: "3",
    name: "Sipho Radebe",
    milestone: "Marked as milestone: consistent swing",
    time: "2 days ago",
  },
]

// ============================================================
// Colored stat tile
// ============================================================

const COLOR_MAP = {
  primary: {
    wash: "bg-primary/10",
    icon: "text-primary",
    shape: "text-primary/15",
  },
  blue: { wash: "bg-blue/10", icon: "text-blue", shape: "text-blue/15" },
  pink: { wash: "bg-pink/10", icon: "text-pink", shape: "text-pink/15" },
  orange: {
    wash: "bg-orange/10",
    icon: "text-orange",
    shape: "text-orange/15",
  },
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: keyof typeof COLOR_MAP
}) {
  const c = COLOR_MAP[color]
  return (
    <div
      className={`relative flex flex-col gap-3 overflow-hidden rounded-2xl ${c.wash} p-5`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className={`pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rotate-12 ${c.shape}`}
      >
        <circle cx="50" cy="50" r="50" fill="currentColor" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`pointer-events-none absolute -top-3 -right-3 h-14 w-14 -rotate-12 ${c.shape}`}
      >
        <path d="M12 2 L22 20 L2 20 Z" fill="currentColor" />
      </svg>

      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-background">
        <Icon className={`h-5 w-5 ${c.icon}`} strokeWidth={1.75} />
      </div>
      <div className="relative flex flex-col gap-0.5">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

// ============================================================
// Page
// ============================================================

export default function CoachDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${coach.greeting}, ${coach.name}`}
        description="Here's what's on your plate today"
        action={
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5 rounded-lg text-xs"
          >
            <Calendar className="h-3.5 w-3.5" />
            Full week
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's schedule */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-medium text-foreground">
              Today&apos;s schedule
            </h2>
            <button className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
              View full week
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col divide-y divide-border/60 rounded-2xl bg-muted/60 px-4">
            {todaySchedule.map((s) => (
              <div key={s.id} className="flex items-center gap-4 py-4">
                <div className="flex w-16 shrink-0 flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {s.time.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {s.time.split(" ")[1]}
                  </span>
                </div>

                <div className="h-8 w-px shrink-0 bg-border" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.programme}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{s.venue}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {s.students}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          {/* Pending assessments */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-medium text-foreground">
                Assessments due
              </h2>
              <span className="rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-semibold text-pink">
                {pendingAssessments.length}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-border/60 rounded-2xl bg-muted/60 px-4">
              {pendingAssessments.map((a) => (
                <button
                  key={a.id}
                  className="flex items-center gap-3 py-3 text-left transition-colors hover:bg-accent/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink/10 text-xs font-medium text-pink">
                    {a.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{a.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.age} yrs · {a.currentLevel ?? "Not yet assessed"}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent progress */}
          <div className="flex flex-col gap-3">
            <h2 className="px-1 text-sm font-medium text-foreground">
              Recent progress
            </h2>

            <div className="flex flex-col gap-2 rounded-2xl bg-blue/10 p-4">
              {recentProgress.map((p) => (
                <div key={p.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue" />
                  </div>
                  <div className="min-w-0 flex-1 pb-2">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{p.name}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.milestone}
                    </p>
                  </div>
                  <span className="shrink-0 pt-0.5 text-[10px] text-muted-foreground">
                    {p.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      <div className="relative flex items-center gap-5 overflow-hidden rounded-2xl bg-orange/10 p-6">
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 text-orange/15"
        >
          <path
            d="M100 10 L190 190 L10 190 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background">
          <Star className="h-5 w-5 text-orange" strokeWidth={1.75} />
        </div>
        <div className="relative flex flex-col gap-0.5">
          <p className="text-sm font-semibold text-foreground">
            Great week so far — 94% attendance across your groups
          </p>
          <p className="text-xs text-muted-foreground">
            Keep it up, your Foundation group has the best streak this month
          </p>
        </div>
      </div>
    </div>
  )
}
