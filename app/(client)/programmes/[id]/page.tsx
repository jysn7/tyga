"use client"

import { useMemo, useState } from "react"
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
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Check,
  X,
  Lock,
  Clock,
  ArrowRight,
} from "lucide-react"
import { parseISO, format } from "date-fns"
import {
  useProgrammeDetail,
  useEnrollableMembers,
} from "@/hooks/client/use-programmes"
import { useMyMembership } from "@/hooks/client/use-membership"
import { Loader } from "@/components/portals/shared/loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EnrollModal } from "@/components/portals/client/programmes/enroll-modal"
import { Button } from "@/components/ui/button"
import type { ProgrammeListItem } from "@/lib/types"

const TYPE_LABELS: Record<string, string> = {
  development: "Development",
  weekly_community: "Community",
  holiday_camp: "Holiday Camp",
  clinic: "Clinic",
  corporate: "Corporate",
  league: "League",
}

const TYPE_PRICE_SUFFIX: Record<string, string> = {
  development: " / term",
  weekly_community: " / session",
  holiday_camp: " / camp",
  clinic: " / clinic",
  corporate: " / booking",
  league: " / season",
}

const DAY_MAP: Record<string, string> = {
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday",
  SU: "Sunday",
}

const DAY_MAP_PLURAL: Record<string, string> = {
  MO: "Mondays",
  TU: "Tuesdays",
  WE: "Wednesdays",
  TH: "Thursdays",
  FR: "Fridays",
  SA: "Saturdays",
  SU: "Sundays",
}

function formatRecurrence(rule: string | null): string | null {
  if (!rule) return null
  const parts = rule.split(";").reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split("=")
    if (k && v) acc[k] = v
    return acc
  }, {})

  const byDay = parts.BYDAY?.split(",") ?? []
  const days = byDay.map((d) => DAY_MAP_PLURAL[d] ?? DAY_MAP[d] ?? d)
  if (days.length === 0) return rule

  const dayLabel =
    days.length === 1
      ? days[0]
      : days.length === 2
        ? `${days[0]} and ${days[1]}`
        : `${days.slice(0, -1).join(", ")}, and ${days[days.length - 1]}`

  return dayLabel
}

function formatAge(minAge: number | null, maxAge: number | null): string {
  if (minAge == null && maxAge == null) return "All ages"
  if (minAge == null) return `Up to ${maxAge}`
  if (maxAge == null) return `${minAge}+`
  if (minAge === 0 && maxAge === 0) return "All ages"
  return `${minAge}–${maxAge}`
}

function formatPrice(price: number): string {
  if (price === 0) return "Free"
  return `R${price}`
}

function formatTermDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  try {
    return format(parseISO(iso), "d MMM yyyy")
  } catch {
    return null
  }
}

export default function ProgrammeDetailPage() {
  const params = useParams<{ id: string }>()
  const programmeId = Number(params.id)

  const {
    data: programme,
    isLoading,
    error,
    refetch,
  } = useProgrammeDetail(programmeId, null)

  const { data: members } = useEnrollableMembers(programmeId)
  const { data: myMembership } = useMyMembership()
  const [enrollOpen, setEnrollOpen] = useState(false)

  const scheduleText = useMemo(() => {
    if (!programme) return null
    const days = formatRecurrence(programme.recurrenceRule)
    if (!days) return null
    const first = programme.sessions?.[0]
    const timeRange =
      first?.startTime && first?.endTime
        ? `${first.startTime.slice(0, 5)} to ${first.endTime.slice(0, 5)}`
        : null
    return timeRange ? `${days}, ${timeRange}` : days
  }, [programme])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-base font-semibold text-foreground">
            Couldn&apos;t load this programme
          </h1>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Something went wrong. Please try again."}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    )
  }

  if (!programme) notFound()

  const name = programme.name ?? "Untitled Programme"
  const type = programme.type ?? ""
  const levelName = programme.levelName ?? "Unassigned level"
  const minAge = programme.minAge ?? null
  const maxAge = programme.maxAge ?? null
  const price = programme.price ?? 0
  const enrolledCount = programme.enrolledCount ?? 0
  const capacity = programme.capacity ?? null
  const maxRatio = programme.maxRatio ?? 0
  const venueName = programme.venueName ?? "No venue"
  const venueAddress = programme.venueAddress ?? null
  const levelGoal = programme.levelGoal ?? null
  const description = programme.description ?? null
  const imageUrl = programme.imageUrl ?? null
  const coaches = programme.coaches ?? []
  const sessions = programme.sessions ?? []
  const curriculumModules = programme.curriculumModules ?? []

  // The detail type carries term dates, but be defensive in case they're absent.
  const termStart =
    (programme as unknown as { termStart?: string | null }).termStart ?? null
  const termEnd =
    (programme as unknown as { termEnd?: string | null }).termEnd ?? null
  const termStartLabel = formatTermDate(termStart)
  const termEndLabel = formatTermDate(termEnd)

  const isFull = capacity !== null && enrolledCount >= capacity
  const spotsLeft =
    capacity !== null ? Math.max(capacity - enrolledCount, 0) : null
  const enrollmentPercentage =
    capacity !== null && capacity > 0 ? (enrolledCount / capacity) * 100 : 0
  const hasCapacity = capacity !== null

  const ageLabel = formatAge(minAge, maxAge)
  const priceLabel = formatPrice(price)
  const priceSuffix = price === 0 ? "" : (TYPE_PRICE_SUFFIX[type] ?? "")

  const eligibleMembers = (members ?? []).filter((m) => m.isEligible)
  const ineligibleMembers = (members ?? []).filter((m) => !m.isEligible)

  const membershipRequired = myMembership?.required === true
  const hasMembership = myMembership?.hasAccess === true
  const membershipBlocked = membershipRequired && !hasMembership
  const membershipStatus = myMembership?.membership?.status ?? null

  const mapQuery = encodeURIComponent(
    `${venueName} ${venueAddress ?? ""}`.trim()
  )
  const venueMap = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
  const contactHref = `/contact?programme=${encodeURIComponent(name)}`

  // Primary call-to-action label and destination — depends on three states:
  // blocked (membership), full (waitlist), or normal (enrol).
  const primaryCta = membershipBlocked
    ? { label: "Set up membership", href: "/billing/membership" as const }
    : isFull
      ? { label: "Join waitlist", href: null }
      : { label: "Enrol now", href: null }

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

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-neutral-900/85 via-foreground/40 to-transparent" />

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

        <div className="absolute top-4 right-4 rounded-md bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
          {priceLabel}
          {priceSuffix && (
            <span className="text-foreground/70">{priceSuffix}</span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-5">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80">
            <span>{ageLabel}</span>
            {termStartLabel && termEndLabel && (
              <>
                <span className="text-background/40">·</span>
                <span>
                  {termStartLabel} – {termEndLabel}
                </span>
              </>
            )}
            {!isFull && spotsLeft !== null && spotsLeft <= 3 && (
              <>
                <span className="text-background/40">·</span>
                <span className="font-medium text-background">
                  {spotsLeft} spots left
                </span>
              </>
            )}
            {isFull && (
              <>
                <span className="text-foreground">·</span>
                <span className="/80 font-medium text-purple">
                  Programme full — waitlist open
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
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
                  {priceLabel}
                </span>
                {priceSuffix && (
                  <span className="text-xs text-muted-foreground">
                    {priceSuffix}
                  </span>
                )}
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

              {(termStartLabel || termEndLabel) && (
                <div className="flex items-start gap-2.5">
                  <CalendarDays
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="text-muted-foreground">Term</span>
                  <span className="ml-auto text-right leading-tight text-foreground">
                    {termStartLabel ?? "TBC"}
                    {termEndLabel && (
                      <>
                        {" – "}
                        {termEndLabel}
                      </>
                    )}
                  </span>
                </div>
              )}

              {scheduleText && (
                <div className="flex items-start gap-2.5">
                  <CalendarDays
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="ml-auto text-right leading-tight text-foreground">
                    {scheduleText}
                  </span>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <Users
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <span className="text-muted-foreground">Ages</span>
                <span className="ml-auto text-foreground">{ageLabel}</span>
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

            {/* Capacity — only when limited */}
            {hasCapacity && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium tracking-wider text-muted-foreground uppercase">
                    Enrollment
                  </span>
                  <span className="font-medium text-foreground">
                    {enrolledCount}/{capacity}
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={enrolledCount}
                  aria-valuemin={0}
                  aria-valuemax={capacity ?? undefined}
                  aria-label="Programme capacity"
                  className="h-1.5 w-full overflow-hidden rounded-full bg-input"
                >
                  <div
                    className={`h-full transition-all ${
                      isFull
                        ? "bg-information"
                        : spotsLeft !== null && spotsLeft <= 2
                          ? "bg-orange"
                          : "bg-blue"
                    }`}
                    style={{ width: `${enrollmentPercentage}%` }}
                  />
                </div>

                <div className="text-xs">
                  {isFull ? (
                    <span className="font-medium text-information">
                      Full — waitlist available
                    </span>
                  ) : spotsLeft !== null && spotsLeft <= 2 ? (
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
            )}

            {/* Who can join */}
            {members && members.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  Who can join
                </span>
                <div className="flex flex-col gap-1">
                  {eligibleMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      {isFull ? (
                        <Clock
                          className="h-3 w-3 shrink-0 text-information"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <Check
                          className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-500"
                          strokeWidth={2.5}
                        />
                      )}
                      <span className="text-foreground">{m.fullName}</span>
                      {isFull && (
                        <span className="text-[10px] text-muted-foreground">
                          (waitlist)
                        </span>
                      )}
                    </div>
                  ))}
                  {ineligibleMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start gap-1.5 text-xs"
                    >
                      <X
                        className="mt-0.5 h-3 w-3 shrink-0 text-destructive"
                        strokeWidth={2.5}
                      />
                      <div className="min-w-0">
                        <span className="text-foreground">{m.fullName}</span>
                        {m.reason && (
                          <span className="block text-[11px] text-muted-foreground">
                            {m.reason}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enrol button — membership > waitlist > enrol */}
            <div className="flex flex-col gap-2">
              {primaryCta.href ? (
                <Link
                  href={primaryCta.href}
                  className="flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-secondary px-4 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  <Lock className="h-3 w-3" strokeWidth={2} />
                  {primaryCta.label}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setEnrollOpen(true)}
                  className="h-10 w-full cursor-pointer rounded-md bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {isFull ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3" strokeWidth={2} />
                      {primaryCta.label}
                    </span>
                  ) : (
                    primaryCta.label
                  )}
                </button>
              )}

              {isFull && !membershipBlocked && (
                <p className="text-[11px] text-muted-foreground">
                  This programme is full. Join the waitlist and we&apos;ll
                  notify you when a place opens up.
                </p>
              )}
              {membershipBlocked && (
                <p className="text-[11px] text-muted-foreground">
                  Membership is required before you can enrol.{" "}
                  <Link
                    href="/billing/membership"
                    className="font-medium text-information underline underline-offset-4"
                  >
                    Learn more
                  </Link>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <a
                href={venueMap}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-center text-information underline transition-colors hover:text-information/70"
              >
                View on Google Maps
                <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
              </a>
              <Link
                href={contactHref}
                className="flex items-center justify-center gap-1.5 text-center text-information underline transition-colors hover:text-information/70"
              >
                <HelpCircle className="h-3 w-3" strokeWidth={1.75} />
                Questions about this programme?
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-6 pb-24 lg:order-1 lg:col-span-2 lg:pb-0">
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
                  {sessions.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                    >
                      <span
                        className={`text-sm ${
                          i === 0
                            ? "font-medium text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {s.sessionDate
                          ? parseISO(s.sessionDate).toLocaleDateString(
                              "en-ZA",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              }
                            )
                          : "No date"}
                        {i === 0 && (
                          <span className="ml-1.5 rounded bg-blue-light px-1.5 py-0.5 text-[10px] font-medium text-blue">
                            Next
                          </span>
                        )}
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

      {/* Sticky mobile enrol bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {priceLabel}
              {priceSuffix && (
                <span className="font-normal text-muted-foreground">
                  {priceSuffix}
                </span>
              )}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {membershipBlocked
                ? "Membership required"
                : isFull
                  ? "Programme full — waitlist open"
                  : `${ageLabel} · ${levelName}`}
            </p>
          </div>
          {membershipBlocked ? (
            <Link
              href="/billing/membership"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-secondary px-4 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <Lock className="h-3 w-3" strokeWidth={2} />
              Set up membership
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setEnrollOpen(true)}
              className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
            >
              {isFull ? (
                <>
                  <Clock className="h-3 w-3" strokeWidth={2} />
                  Join waitlist
                </>
              ) : (
                "Enrol now"
              )}
            </button>
          )}
        </div>
      </div>

      <EnrollModal
        programme={programme as unknown as ProgrammeListItem}
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        membershipBlocked={membershipBlocked}
        membershipStatus={membershipStatus}
      />
    </div>
  )
}
