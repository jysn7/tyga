"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import {
  MapPin,
  CalendarDays,
  Users,
  GraduationCap,
  BookOpen,
  Target,
} from "lucide-react"
import { useProgrammeDetail } from "@/hooks/client/use-programmes"
import { Loader } from "@/components/portals/shared/loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EnrollModal } from "@/components/portals/client/programmes/enroll-modal"
import type { ProgrammeListItem } from "@/lib/types"

export default function ProgrammeDetailPage() {
  const params = useParams<{ id: string }>()
  const programmeId = Number(params.id)

  const {
    data: programme,
    isLoading,
    error,
  } = useProgrammeDetail(programmeId, null)
  const [enrollOpen, setEnrollOpen] = useState(false)

  if (error) console.error("[ProgrammeDetailPage] error:", error)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error || !programme) notFound()

  const name = programme.name ?? "Untitled Programme"
  const levelName = programme.levelName ?? "Unassigned level"
  const minAge = programme.minAge ?? 0
  const maxAge = programme.maxAge ?? 0
  const price = programme.price ?? 0
  const enrolledCount = programme.enrolledCount ?? 0
  const capacity = programme.capacity ?? 1
  const maxRatio = programme.maxRatio ?? 0
  const venueName = programme.venueName ?? "No venue"
  const venueAddress = programme.venueAddress ?? null
  const levelGoal = programme.levelGoal ?? null
  const coaches = programme.coaches ?? []
  const sessions = programme.sessions ?? []
  const curriculumModules = programme.curriculumModules ?? []

  const isFull = enrolledCount >= capacity
  const spotsLeft = Math.max(capacity - enrolledCount, 0)
  const enrollmentPercentage =
    capacity > 0 ? (enrolledCount / capacity) * 100 : 0
  const mapQuery = encodeURIComponent(
    `${venueName} ${venueAddress ?? ""}`.trim()
  )
  const venueMap = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  return (
    <div className="mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href="/programmes"
          className="transition-colors hover:text-foreground"
        >
          Programmes
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
          <GraduationCap
            className="h-4.5 w-4.5 text-foreground"
            strokeWidth={1.75}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
            {name}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {levelName} · Ages {minAge}–{maxAge}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="lg:order-2 lg:col-span-1">
          <div className="sticky top-6 flex flex-col gap-5 rounded-xl bg-card p-6 shadow ring-0">
            {/* Price */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Price
              </span>
              <div className="text-right">
                <span className="text-xl font-semibold tracking-tight text-foreground">
                  R{price}
                </span>
                <span className="text-xs text-muted-foreground"> / term</span>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* Meta */}
            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <span className="text-muted-foreground">Venue</span>
                <div className="ml-auto text-right leading-tight">
                  <span className="text-foreground">{venueName}</span>
                  {venueAddress && (
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {venueAddress}
                    </span>
                  )}
                </div>
              </div>

              {programme.recurrenceRule && (
                <div className="flex items-start gap-2.5">
                  <CalendarDays
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="ml-auto text-right leading-tight text-foreground">
                    {programme.recurrenceRule}
                  </span>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <Users
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <span className="text-muted-foreground">Ages</span>
                <span className="ml-auto text-foreground">
                  {minAge}–{maxAge}
                </span>
              </div>

              {maxRatio > 0 && (
                <div className="flex items-start gap-2.5">
                  <Users
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="text-muted-foreground">Coach ratio</span>
                  <span className="ml-auto text-foreground">1:{maxRatio}</span>
                </div>
              )}
            </div>

            <div className="h-px bg-border/60" />

            {/* Enrollment */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium tracking-wide text-muted-foreground uppercase">
                  Enrollment
                </span>
                <span className="font-medium text-foreground">
                  {enrolledCount}/{capacity}
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-input">
                <div
                  className={`h-full transition-all ${
                    isFull
                      ? "bg-destructive"
                      : spotsLeft <= 2
                        ? "bg-orange"
                        : "bg-primary"
                  }`}
                  style={{ width: `${enrollmentPercentage}%` }}
                />
              </div>

              <div className="text-xs">
                {isFull ? (
                  <span className="font-medium text-destructive">
                    Programme full
                  </span>
                ) : spotsLeft <= 2 ? (
                  <span className="font-medium text-orange">
                    {spotsLeft} spots remaining
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {spotsLeft} spots available
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={isFull}
              onClick={() => setEnrollOpen(true)}
              className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isFull ? "Programme full" : "Enrol now"}
            </button>

            <a
              href={venueMap}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-xs text-muted-foreground underline transition-colors hover:text-foreground"
            >
              View venue on Google Maps
            </a>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-4 lg:order-1 lg:col-span-2">
          {levelGoal && (
            <section className="flex flex-col gap-3 rounded-xl bg-card p-6 shadow ring-0">
              <div className="flex items-center gap-2.5">
                <Target
                  className="h-3.5 w-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Programme goal
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {levelGoal}
              </p>
            </section>
          )}

          <section className="flex flex-col gap-3 rounded-xl bg-card p-6 shadow ring-0">
            <div className="flex items-center gap-2.5">
              <Users
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={1.75}
              />
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Coaches
              </h2>
            </div>
            {coaches.length > 0 ? (
              <div className="flex flex-col divide-y divide-border/60">
                {coaches.map((c) => {
                  const initials = (c.name ?? "Coach")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()

                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <Avatar className="h-9 w-9 shrink-0 rounded-full">
                        <AvatarImage
                          src={c.avatar_url ?? undefined}
                          alt={c.name ?? "Coach"}
                        />
                        <AvatarFallback className="bg-input text-[11px] font-medium text-muted-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {c.name ?? "Coach"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground capitalize">
                          {c.role?.replace(/_/g, " ") ?? "—"}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No coaches assigned yet
              </p>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-xl bg-card p-6 shadow ring-0">
            <div className="flex items-center gap-2.5">
              <CalendarDays
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={1.75}
              />
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Upcoming sessions
              </h2>
            </div>
            {sessions.length > 0 ? (
              <div className="flex flex-col divide-y divide-border/60">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {s.sessionDate
                        ? new Date(s.sessionDate).toLocaleDateString("en-ZA", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })
                        : "No date"}
                    </span>
                    <span className="rounded-md bg-input px-2 py-0.5 text-xs text-muted-foreground">
                      {s.startTime?.slice(0, 5) ?? "--:--"} –{" "}
                      {s.endTime?.slice(0, 5) ?? "--:--"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No sessions scheduled
              </p>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-xl bg-card p-6 shadow ring-0">
            <div className="flex items-center gap-2.5">
              <BookOpen
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={1.75}
              />
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                What they&apos;ll learn
              </h2>
            </div>
            {curriculumModules.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {curriculumModules.map((m) => (
                  <span
                    key={m.id}
                    className="rounded-md bg-input px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {m.name ?? "Module"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No curriculum available
              </p>
            )}
          </section>
        </div>
      </div>

      <EnrollModal
        programme={programme as unknown as ProgrammeListItem}
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
      />
    </div>
  )
}
