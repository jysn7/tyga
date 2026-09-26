"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, notFound } from "next/navigation"
import {
  MapPin,
  CalendarDays,
  Users,
  GraduationCap,
  BookOpen,
  Target,
  ExternalLink,
} from "lucide-react"
import { useProgrammeDetail } from "@/hooks/client/use-programmes"
import { Loader } from "@/components/portals/shared/loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EnrollModal } from "@/components/portals/client/programmes/enroll-modal"
import type { ProgrammeListItem } from "@/lib/types"

const TYPE_LABELS: Record<string, string> = {
  development: "Development",
  weekly_community: "Community",
  holiday_camp: "Holiday Camp",
  clinic: "Clinic",
  corporate: "Corporate",
  league: "League",
}

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
  const type = programme.type ?? ""
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
  const description = programme.description ?? null
  const imageUrl = programme.imageUrl ?? null
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
    <div className="mx-auto py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href="/programmes"
          className="transition-colors hover:text-foreground"
        >
          Programmes
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{name}</span>
      </nav>

      {/* Hero image */}
      <div className="relative mb-6 aspect-16/8 w-full overflow-hidden rounded-xl bg-muted shadow md:aspect-16/6">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-light">
            <GraduationCap className="h-10 w-10 text-blue" strokeWidth={1.5} />
          </div>
        )}

        {/* Dark gradient bottom → middle */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-neutral-900/85 via-foreground/40 to-transparent" />

        {/* Level + type chips top-left */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
          {type && (
            <span className="rounded-md bg-background/85 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
              {TYPE_LABELS[type] ?? type}
            </span>
          )}
          <span className="rounded-md bg-background/85 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
            {levelName}
          </span>
        </div>

        {/* Price chip top-right */}
        <div className="absolute top-4 right-4 rounded-md bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
          R{price}
          <span className="text-foreground/70"> / term</span>
        </div>

        {/* Title + meta pinned to bottom of image */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-5">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80">
            <span>
              Ages {minAge}–{maxAge}
            </span>
            {!isFull && spotsLeft <= 3 && (
              <>
                <span className="text-background/40">·</span>
                <span className="font-medium text-background">
                  {spotsLeft} spots left
                </span>
              </>
            )}
            {isFull && (
              <>
                <span className="text-background/40">·</span>
                <span className="font-medium text-background">
                  Programme full
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description + CTA row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          {description ? (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">
              No description provided.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="lg:order-2 lg:col-span-1">
          <div className="sticky top-6 flex flex-col gap-5 rounded-xl bg-card p-5 shadow">
            {/* Price */}
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Price
              </span>
              <div className="text-right">
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  R{price}
                </span>
                <span className="text-xs text-muted-foreground"> / term</span>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* Meta */}
            <div className="flex flex-col gap-3 text-xs">
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
                <span className="font-medium tracking-wider text-muted-foreground uppercase">
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
                        : "bg-blue"
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
              className="h-10 w-full cursor-pointer rounded-md bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isFull ? "Programme full" : "Enrol now"}
            </button>

            <a
              href={venueMap}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-center text-xs text-information underline transition-colors hover:text-information/70"
            >
              View on Google Maps
              <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
            </a>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-6 lg:order-1 lg:col-span-2">
          {levelGoal && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Target
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Programme goal
                </h2>
              </div>
              <div className="rounded-xl bg-card p-5 shadow">
                <p className="text-sm leading-relaxed text-foreground">
                  {levelGoal}
                </p>
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Users
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Coaches
              </h2>
            </div>
            <div className="rounded-xl bg-card p-5 shadow">
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
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <Avatar className="h-9 w-9 shrink-0 rounded-full">
                          <AvatarImage
                            src={c.avatar_url ?? undefined}
                            alt={c.name ?? "Coach"}
                          />
                          <AvatarFallback className="rounded-full bg-blue-light text-[11px] font-semibold text-blue">
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
                <p className="text-xs text-muted-foreground">
                  No coaches assigned yet
                </p>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Upcoming sessions
              </h2>
            </div>
            <div className="rounded-xl bg-card p-5 shadow">
              {sessions.length > 0 ? (
                <div className="flex flex-col divide-y divide-border/60">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                    >
                      <span className="text-sm text-foreground">
                        {s.sessionDate
                          ? new Date(s.sessionDate).toLocaleDateString(
                              "en-ZA",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              }
                            )
                          : "No date"}
                      </span>
                      <span className="rounded-md bg-input px-2 py-0.5 text-[11px] text-muted-foreground">
                        {s.startTime?.slice(0, 5) ?? "--:--"} –{" "}
                        {s.endTime?.slice(0, 5) ?? "--:--"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No sessions scheduled
                </p>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <BookOpen
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                What they&apos;ll learn
              </h2>
            </div>
            <div className="rounded-xl bg-card p-5 shadow">
              {curriculumModules.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {curriculumModules.map((m) => (
                    <span
                      key={m.id}
                      className="rounded-full bg-blue-light px-3 py-0.5 text-[11px] font-medium text-blue"
                    >
                      {m.name ?? "Module"}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No curriculum available
                </p>
              )}
            </div>
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
