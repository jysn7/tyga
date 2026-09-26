import Link from "next/link"
import Image from "next/image"
import { MapPin, ArrowUpRight, GraduationCap } from "lucide-react"

export type Programme = {
  id: string
  name: string
  type:
    | "development"
    | "weekly_community"
    | "holiday_camp"
    | "clinic"
    | "corporate"
    | "league"
  levelName: string
  venueName: string
  minAge: number
  maxAge: number
  genderRestriction: "male" | "female" | "any"
  recurrenceRule: string
  price: number
  capacity: number
  enrolledCount: number
  maxRatio: number
  description?: string | null
  imageUrl?: string | null
}

const typeLabels: Record<Programme["type"], string> = {
  development: "Development",
  weekly_community: "Community",
  holiday_camp: "Holiday Camp",
  clinic: "Clinic",
  corporate: "Corporate",
  league: "League",
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + "…"
}

export function ProgrammeCard({ programme }: { programme: Programme }) {
  const isFull = programme.enrolledCount >= programme.capacity
  const spotsLeft = programme.capacity - programme.enrolledCount
  const fillPercentage = Math.min(
    100,
    Math.round((programme.enrolledCount / programme.capacity) * 100)
  )

  return (
    <Link
      href={`/programmes/${programme.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-colors hover:border-border"
    >
      {/* Cover image with overlay */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {programme.imageUrl ? (
          <Image
            src={programme.imageUrl}
            alt={programme.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-light">
            <GraduationCap className="h-6 w-6 text-blue" strokeWidth={1.75} />
          </div>
        )}

        {/* Dark gradient overlay from bottom → middle */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />

        {/* Overlaid content pinned to bottom */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[10px] font-medium tracking-wider text-background/70 uppercase">
              {typeLabels[programme.type]}
            </span>
            <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-background">
              {programme.name}
            </h3>
          </div>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-background/70 opacity-0 transition-opacity group-hover:opacity-100"
            strokeWidth={1.75}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Description truncated */}
        {programme.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {truncate(programme.description, 120)}
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground/60 italic">
            No description provided.
          </p>
        )}

        {/* Meta row */}
        <div className="mt-auto flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{programme.venueName}</span>
            <span className="text-border">·</span>
            <span className="shrink-0">{programme.levelName}</span>
            <span className="text-border">·</span>
            <span className="shrink-0">
              {programme.minAge}–{programme.maxAge}y
            </span>
          </div>

          {/* Capacity micro-indicator */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                {programme.enrolledCount}/{programme.capacity} enrolled
              </span>
              <span
                className={
                  isFull
                    ? "font-medium text-destructive"
                    : "text-muted-foreground"
                }
              >
                {isFull ? "Full" : `${spotsLeft} spots left`}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all duration-300 ${
                  isFull ? "bg-destructive" : "bg-foreground"
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Price row */}
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-[11px] text-muted-foreground">Per term</span>
            <span className="text-sm font-semibold text-foreground">
              R{programme.price}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
