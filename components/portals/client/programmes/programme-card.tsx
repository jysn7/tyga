import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Clock,
  Users,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

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
  const enrollmentPercentage =
    (programme.enrolledCount / programme.capacity) * 100

  return (
    <Card className="group border-0.5 bg-tertiary h-full rounded-md border-border shadow transition-all duration-200 hover:border-foreground/20">
      <CardHeader className="space-y-2 p-4 pb-2">
        <div className="flex items-center justify-between">
          <span className="bg-tertiary inline-flex w-fit items-center rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {typeLabels[programme.type]}
          </span>
          <span className="text-xs text-muted-foreground">
            <Calendar className="mr-1 inline h-3 w-3" />
            {programme.recurrenceRule.split(",").length}x/week
          </span>
        </div>
        <div>
          <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-foreground">
            {programme.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {programme.levelName} · Ages {programme.minAge}–{programme.maxAge}
            {programme.genderRestriction !== "any" && (
              <span className="ml-1 capitalize">
                · {programme.genderRestriction}
              </span>
            )}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-2">
        <div className="bg-tertiary space-y-1.5 rounded-md p-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{programme.venueName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{programme.recurrenceRule}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Progress
            value={enrollmentPercentage}
            className="bg-tertiary h-1.5 rounded-full"
          />
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>
                {programme.enrolledCount}/{programme.capacity} enrolled
              </span>
            </div>
            {isFull ? (
              <span className="font-medium text-destructive">Full</span>
            ) : spotsLeft <= 2 ? (
              <span className="font-medium text-foreground">
                {spotsLeft} left
              </span>
            ) : (
              <span className="text-muted-foreground">{spotsLeft} spots</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-semibold text-foreground">
              R{programme.price}
            </span>
            <span className="text-[10px] font-normal text-muted-foreground">
              /term
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isFull && (
              <Button
                size="sm"
                className="h-8 gap-1 rounded-md px-3 text-xs font-medium"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Enroll
              </Button>
            )}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hover:bg-tertiary h-8 gap-1 rounded-md px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Link href={`/programmes/${programme.id}`}>View</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
