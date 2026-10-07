"use client"

import { CalendarDays, CheckCircle2, Clock, MapPin, Users } from "lucide-react"
import { format } from "date-fns"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { StatusBadge } from "@/components/portals/shared/StatusBadge"
import type { CoachSessionDetail } from "@/hooks/coach/use-sessions"

function formatTime(time: string | null) {
  return time?.slice(0, 5) ?? "Not set"
}

export function SessionsOverviewTab({
  detail,
}: {
  detail: CoachSessionDetail | null
}) {
  if (!detail) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Session details unavailable"
        description="The session could not be loaded."
      />
    )
  }

  const isOverRatio =
    detail.is_over_ratio ??
    (detail.max_ratio !== null &&
      detail.coach_count !== undefined &&
      detail.enrolled_count > detail.max_ratio * detail.coach_count)
  const ratio =
    detail.max_ratio === null
      ? "Not configured"
      : detail.coach_count === undefined
        ? `1:${detail.max_ratio}`
        : detail.coach_count === 0
          ? `${detail.enrolled_count} members; no coaches assigned (max 1:${detail.max_ratio})`
          : `1:${Math.ceil(detail.enrolled_count / detail.coach_count)} (max 1:${detail.max_ratio})`

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl bg-card p-5 shadow">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {detail.programme_name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Session overview
            </p>
          </div>
          {detail.status && <StatusBadge status={detail.status} />}
        </div>

        <dl className="grid gap-4 pt-4 sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <CalendarDays
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs text-muted-foreground">Date</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {detail.session_date
                  ? format(
                      new Date(`${detail.session_date}T00:00:00`),
                      "EEEE, d MMMM yyyy"
                    )
                  : "Not available"}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs text-muted-foreground">Time</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {formatTime(detail.start_time)} – {formatTime(detail.end_time)}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs text-muted-foreground">Venue</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {detail.venue_name ?? "Not set"}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Users
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs text-muted-foreground">Enrolled</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {detail.enrolled_count}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs text-muted-foreground">Staffing ratio</dt>
              <dd
                className={`mt-0.5 text-sm font-medium ${isOverRatio ? "text-destructive" : "text-foreground"}`}
              >
                {ratio}
                {isOverRatio && " — above recommended ratio"}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      {detail.coach_assignments && detail.coach_assignments.length > 0 && (
        <section className="rounded-xl bg-card p-5 shadow">
          <h2 className="text-sm font-semibold text-foreground">
            Assigned coaches
          </h2>
          <ul className="mt-3 divide-y divide-border/60">
            {detail.coach_assignments.map((coach) => (
              <li
                key={coach.coach_id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-foreground">
                  {coach.coach_name ?? `Coach ${coach.coach_id}`}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {coach.role_in_session ?? "Coach"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail.coach_notes && (
        <section className="rounded-xl bg-card p-5 shadow">
          <h2 className="text-sm font-semibold text-foreground">
            Session notes
          </h2>
          <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
            {detail.coach_notes}
          </p>
        </section>
      )}
    </div>
  )
}
