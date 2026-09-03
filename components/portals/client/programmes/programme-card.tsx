import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowUpRight } from "lucide-react"

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
}

const typeLabels: Record<Programme["type"], string> = {
  development: "Development",
  weekly_community: "Community",
  holiday_camp: "Holiday Camp",
  clinic: "Clinic",
  corporate: "Corporate",
  league: "League",
}

export function ProgrammeCard({ programme }: { programme: Programme }) {
  const isFull = programme.enrolledCount >= programme.capacity
  const spotsLeft = programme.capacity - programme.enrolledCount
  const fillPercentage = Math.min(
    100,
    Math.round((programme.enrolledCount / programme.capacity) * 100)
  )

  return (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-lg bg-card p-5 shadow transition-all duration-200 hover:border-border hover:shadow-xs">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            {typeLabels[programme.type]}
          </span>
          <h3 className="line-clamp-1 text-base font-medium tracking-tight text-foreground">
            {programme.name}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-base font-semibold text-foreground">
            R{programme.price}
          </span>
          <span className="text-xs text-muted-foreground">/term</span>
        </div>
      </div>

      {/* Primary Details */}
      <div className="my-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{programme.venueName}</span>
          <span>·</span>
          <span className="shrink-0">{programme.levelName}</span>
        </div>

        {/* Capacity Micro-indicator */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
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
              className="h-full bg-foreground transition-all duration-300"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button disabled={isFull} className="h-9 flex-1">
          <Link href={`/programmes/${programme.id}`}>
            {isFull ? "Waitlist" : "Enroll"}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-border/60 bg-card"
        >
          <Link href={`/programmes/${programme.id}`}>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
