"use client"

import Link from "next/link"
import {
  useParentSessionDetail,
  useParentMemberAttendanceSummary,
} from "@/hooks/client/use-parent-sessions"
import type { ParentSessionDetail } from "@/hooks/client/use-parent-sessions"
import {
  MapPin,
  User,
  Calendar,
  BookOpen,
  FileText,
  Info,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  Users,
  Layers,
  Quote,
  type LucideIcon,
} from "lucide-react"

// ---------- Helpers ----------

const STATUS_STYLE: Record<
  string,
  { label: string; pill: string; dot: string }
> = {
  present: { label: "Present", pill: "bg-green-light", dot: "bg-green" },
  late: { label: "Late", pill: "bg-yellow-light", dot: "bg-yellow" },
  absent: { label: "Absent", pill: "bg-red-light", dot: "bg-rose" },
  excused: { label: "Excused", pill: "bg-blue-light", dot: "bg-blue" },
}

const AVATAR_TINTS = [
  "bg-blue-light",
  "bg-green-light",
  "bg-purple-light",
  "bg-yellow-light",
  "bg-orange-light",
  "bg-red-light",
]

const CHIP_TINTS = [
  "bg-blue-light",
  "bg-green-light",
  "bg-yellow-light",
  "bg-purple-light",
  "bg-orange-light",
  "bg-red-light",
]

const toDate = (d: string) => new Date(`${d}T00:00:00`)

const fmtDate = (d: string) =>
  toDate(d).toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

const fmtTime = (t: string) => t.slice(0, 5)

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")

function relativeDay(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round(
    (toDate(dateStr).getTime() - today.getTime()) / 86_400_000
  )
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  if (diff > 1) return `In ${diff} days`
  if (diff === -1) return "Yesterday"
  return `${-diff} days ago`
}

const rateColor = (rate: number) =>
  rate >= 80 ? "var(--green)" : rate >= 60 ? "var(--yellow)" : "var(--rose)"

// ---------- Small building blocks ----------

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  tint,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  tint: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tint}`}
      >
        <Icon className="h-4 w-4 text-foreground/80" strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  tint: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 ${tint}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-white/50"
      />
      <Icon
        className="relative h-4 w-4 text-foreground/70"
        strokeWidth={1.75}
      />
      <p className="relative mt-3 text-xl leading-none font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="relative mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function Donut({
  value,
  color,
  size = 64,
  stroke = 7,
}: {
  value: number
  color: string
  size?: number
  stroke?: number
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(Math.max(value, 0), 100) / 100) * c

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          style={{ stroke: "var(--muted)" }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ stroke: color }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
        {Math.round(value)}%
      </span>
    </div>
  )
}

function ChildAttendanceItem({
  index,
  memberId,
  fullName,
  attendanceStatus,
  isCancelled,
}: {
  index: number
  memberId: number
  fullName: string
  attendanceStatus: string | null
  isCancelled: boolean
}) {
  const { data: summary } = useParentMemberAttendanceSummary(memberId)

  const status = attendanceStatus ? STATUS_STYLE[attendanceStatus] : null
  const total = summary?.total_marked ?? 0

  const segments = summary
    ? [
        {
          key: "present",
          count: summary.present,
          color: "var(--green)",
          label: "present",
        },
        {
          key: "late",
          count: summary.late,
          color: "var(--yellow)",
          label: "late",
        },
        {
          key: "absent",
          count: summary.absent,
          color: "var(--rose)",
          label: "absent",
        },
        {
          key: "excused",
          count: summary.excused,
          color: "var(--blue)",
          label: "excused",
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-foreground ${
              AVATAR_TINTS[index % AVATAR_TINTS.length]
            }`}
          >
            {initials(fullName)}
          </span>
          <span className="text-sm font-medium text-foreground">
            {fullName}
          </span>
        </div>

        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-foreground ${
            status ? status.pill : isCancelled ? "bg-red-light" : "bg-muted"
          }`}
        >
          {status && (
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          )}
          {status
            ? status.label
            : isCancelled
              ? "Session cancelled"
              : "Not marked yet"}
        </span>
      </div>

      {summary && total > 0 ? (
        <div className="flex items-center gap-4">
          {summary.attendance_rate !== null && (
            <Donut
              value={summary.attendance_rate}
              color={rateColor(summary.attendance_rate)}
            />
          )}
          <div className="flex flex-1 flex-col">
            <p className="mb-1.5 text-[11px] text-muted-foreground">
              Overall attendance across {total}{" "}
              {total === 1 ? "session" : "sessions"}
            </p>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
              {segments
                .filter((s) => s.count > 0)
                .map((s) => (
                  <div
                    key={s.key}
                    title={`${s.count} ${s.label}`}
                    style={{
                      width: `${(s.count / total) * 100}%`,
                      background: s.color,
                    }}
                  />
                ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {segments
                .filter((s) => s.count > 0)
                .map((s) => (
                  <span key={s.key} className="flex items-center gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: s.color }}
                    />
                    {s.count} {s.label}
                  </span>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No attendance history yet.
        </p>
      )}
    </div>
  )
}

// ---------- Page view ----------

export function SessionDetailView({
  session: initialSession,
  sessionId,
}: {
  session?: ParentSessionDetail
  sessionId?: number | string
}) {
  const numericId =
    sessionId != null ? Number(sessionId) : (initialSession?.session_id ?? 0)
  const {
    data: fetchedSession,
    isLoading,
    error,
  } = useParentSessionDetail(numericId)

  const session = initialSession ?? fetchedSession

  if (!initialSession && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2
          className="h-5 w-5 animate-spin text-muted-foreground"
          strokeWidth={1.75}
        />
      </div>
    )
  }

  if (!initialSession && (error || !session)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-8 text-center shadow">
        <AlertCircle className="h-5 w-5 text-destructive" strokeWidth={1.75} />
        <span className="text-sm font-medium text-foreground">
          Could not load session details
        </span>
        <span className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Please try again later."}
        </span>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const { venue } = session
  const mapUrl =
    venue.latitude != null && venue.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
      : null

  const dateObj = toDate(session.session_date)
  const monthLabel = dateObj.toLocaleDateString("en-ZA", { month: "short" })
  const weekdayLabel = dateObj.toLocaleDateString("en-ZA", { weekday: "short" })
  const dayNumber = dateObj.getDate()

  const tiles = [
    {
      icon: Clock,
      label: "Duration",
      value: `${session.duration_minutes} min`,
      tint: "bg-blue-light",
    },
    {
      icon: Users,
      label: session.children.length === 1 ? "Child" : "Children",
      value: session.children.length,
      tint: "bg-green-light",
    },
    {
      icon: User,
      label: session.coaches.length === 1 ? "Coach" : "Coaches",
      value: session.coaches.length || "TBC",
      tint: "bg-yellow-light",
    },
    {
      icon: Layers,
      label: session.curriculum.length === 1 ? "Module" : "Modules",
      value: session.curriculum.length,
      tint: "bg-purple-light",
    },
  ]

  return (
    <div className="mx-auto flex flex-col gap-6">
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Hero */}
          <header className="relative overflow-hidden rounded-2xl bg-card p-6 shadow">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] opacity-40"
            />
            <span
              aria-hidden
              className={`pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full ${
                session.is_cancelled ? "bg-red-light" : "bg-blue-light"
              }`}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute top-14 right-28 h-5 w-5 rounded-full bg-yellow"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -bottom-10 h-28 w-28 rounded-full border-[14px] border-pink opacity-40"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-6 left-1/2 h-3 w-3 rounded-full bg-teal opacity-70"
            />

            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Date tile */}
              <div className="flex h-24 w-20 shrink-0 flex-col items-center overflow-hidden rounded-xl border border-border bg-card shadow">
                <span
                  className={`w-full py-1 text-center text-[10px] font-semibold tracking-wider uppercase ${
                    session.is_cancelled
                      ? "bg-destructive text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {monthLabel}
                </span>
                <span className="pt-1.5 text-3xl leading-none font-bold text-foreground">
                  {dayNumber}
                </span>
                <span className="mt-1 text-[10px] text-muted-foreground">
                  {weekdayLabel}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {session.level_name && (
                    <span className="rounded-full bg-pink px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                      {session.level_name}
                    </span>
                  )}
                  {session.is_cancelled ? (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                      Cancelled
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-light px-2 py-0.5 text-[11px] font-medium text-foreground">
                      {relativeDay(session.session_date)}
                    </span>
                  )}
                </div>

                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {session.programme_name}
                </h1>

                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock
                      className="h-3.5 w-3.5 shrink-0"
                      strokeWidth={1.75}
                    />
                    {fmtTime(session.start_time)} – {fmtTime(session.end_time)}{" "}
                    · {session.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar
                      className="h-3.5 w-3.5 shrink-0"
                      strokeWidth={1.75}
                    />
                    {fmtDate(session.session_date)}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((t) => (
              <StatTile key={t.label} {...t} />
            ))}
          </div>

          {/* Venue card */}
          <section className="flex flex-col gap-3">
            <SectionHeader
              icon={MapPin}
              title="Venue"
              subtitle="Location and address details"
              tint="bg-input"
            />
            <div className="relative overflow-hidden rounded-2xl bg-card p-5 shadow">
              {/* Map-style background */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:28px_28px] opacity-50"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 -left-6 h-3 w-[130%] -rotate-12 rounded-full bg-muted"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute top-0 right-24 h-full w-3 rotate-12 rounded-full bg-muted"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute right-6 bottom-5 flex h-9 w-9 items-center justify-center"
              >
                <span className="absolute h-9 w-9 animate-ping rounded-full bg-rose/30 motion-reduce:animate-none" />
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-rose">
                  <MapPin className="h-4 w-4 text-white" strokeWidth={2} />
                </span>
              </span>

              <div className="relative flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {venue.name}
                </span>
                {venue.address && (
                  <p className="max-w-[70%] text-xs text-muted-foreground">
                    {venue.address}
                  </p>
                )}
                {mapUrl && (
                  <div className="pt-2">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      Open in Maps
                      <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Coaches card */}
          <section className="flex flex-col gap-3">
            <SectionHeader
              icon={User}
              title={session.coaches.length === 1 ? "Coach" : "Coaches"}
              subtitle="Assigned trainers for this session"
              tint="bg-input"
            />
            <div className="flex flex-wrap gap-3 rounded-2xl bg-card p-5 shadow">
              {session.coaches.length ? (
                session.coaches.map((c, i) => (
                  <div
                    key={c.coach_id}
                    className="flex items-center gap-2.5 rounded-full border border-border/60 py-1 pr-4 pl-1"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-foreground ${
                        AVATAR_TINTS[(i + 2) % AVATAR_TINTS.length]
                      }`}
                    >
                      {initials(c.full_name)}
                    </span>
                    <span className="text-sm text-foreground">
                      {c.full_name}
                    </span>
                  </div>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-border px-4 py-1.5 text-sm text-muted-foreground">
                  To be confirmed
                </span>
              )}
            </div>
          </section>

          {/* Attendance */}
          <section className="flex flex-col gap-3">
            <SectionHeader
              icon={Users}
              title="Attendance"
              subtitle="Recorded status and historical rates for this session"
              tint="bg-input"
            />
            <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow">
              {session.children.map((c, i) => (
                <ChildAttendanceItem
                  key={c.member_id}
                  index={i}
                  memberId={c.member_id}
                  fullName={c.full_name}
                  attendanceStatus={c.attendance_status}
                  isCancelled={session.is_cancelled}
                />
              ))}
            </div>
          </section>

          {/* Curriculum covered */}
          {session.curriculum.length > 0 && (
            <section className="flex flex-col gap-3">
              <SectionHeader
                icon={BookOpen}
                title="What we covered"
                subtitle="Modules completed during this session"
                tint="bg-input"
              />
              <div className="flex flex-wrap gap-2 rounded-2xl bg-card p-5 shadow">
                {session.curriculum.map((m, i) => (
                  <span
                    key={m.module_id}
                    className={`rounded-full px-3 py-1 text-xs text-foreground ${
                      CHIP_TINTS[i % CHIP_TINTS.length]
                    }`}
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Coach notes */}
          {session.coach_notes && (
            <section className="flex flex-col gap-3">
              <SectionHeader
                icon={FileText}
                title="Notes from the coach"
                subtitle="Feedback and updates regarding performance"
                tint="bg-input"
              />
              <div className="relative overflow-hidden rounded-2xl border-l-4 border-yellow bg-yellow-light p-5 shadow">
                <Quote
                  aria-hidden
                  className="pointer-events-none absolute -top-1 right-4 h-14 w-14 text-yellow opacity-30"
                  strokeWidth={1.5}
                />
                <p className="relative text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                  {session.coach_notes}
                </p>
              </div>
            </section>
          )}

          {/* Navigation */}
          <nav className="flex items-center justify-between pt-2">
            {session.previous_session_id ? (
              <Link
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
                href={`/my-schedule/${session.previous_session_id}`}
              >
                <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
                Previous session
              </Link>
            ) : (
              <span />
            )}
            {session.next_session_id ? (
              <Link
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
                href={`/my-schedule/${session.next_session_id}`}
              >
                Next session
                <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Timeline */}
          <section className="flex flex-col gap-3">
            <SectionHeader
              icon={Clock}
              title="Session timeline"
              subtitle="Start and finish"
              tint="bg-input"
            />
            <div className="relative overflow-hidden rounded-2xl bg-card p-5 shadow">
              <span
                aria-hidden
                className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-teal opacity-15"
              />
              <div className="relative flex gap-4">
                <div className="flex flex-col items-center py-1">
                  <span className="h-3 w-3 rounded-full bg-green" />
                  <span className="my-1 min-h-10 w-0.5 flex-1 rounded bg-border" />
                  <span className="h-3 w-3 rounded-full bg-rose" />
                </div>
                <div className="flex flex-col justify-between gap-6">
                  <div>
                    <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                      Starts
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {fmtTime(session.start_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                      Ends
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {fmtTime(session.end_time)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {session.programme_description && (
            <section className="flex flex-col gap-3">
              <SectionHeader
                icon={Info}
                title="About programme"
                subtitle="General overview"
                tint="bg-input"
              />
              <div className="relative overflow-hidden rounded-2xl bg-card p-5 shadow">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-purple-light"
                />
                <p className="relative text-xs leading-relaxed text-muted-foreground">
                  {session.programme_description}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
