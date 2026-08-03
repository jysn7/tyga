import { Users, Calendar, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EnrollmentSheet } from "@/components/portals/client/programmes/enrollment-sheet"
import { StatusPill } from "@/components/portals/shared/status-pill"
import { PropertyGrid } from "@/components/portals/shared/property-grid"
import { TYPE_COLORS, TYPE_LABELS } from "@/lib/constants/programmes"
import type { ProgrammeDetail } from "@/lib/data/programmes"

export function ProgrammeHero({ programme }: { programme: ProgrammeDetail }) {
  const isFull = programme.enrolledCount >= programme.capacity
  const spotsLeft = programme.capacity - programme.enrolledCount

  const statusVariant = isFull
    ? "danger"
    : spotsLeft <= 2
      ? "warning"
      : "success"
  const statusLabel = isFull ? "Full" : `${spotsLeft} spots available`

  const gridItems = [
    {
      label: "Status",
      content: <StatusPill label={statusLabel} variant={statusVariant} />,
    },
    {
      label: "Price",
      content: (
        <p className="text-sm font-medium text-foreground">
          R{programme.price}{" "}
          <span className="font-normal text-muted-foreground">/ term</span>
        </p>
      ),
    },
    {
      label: "Type",
      content: (
        <Badge
          variant="outline"
          className={`bg-tertiary rounded-md border-transparent px-2.5 py-1 text-xs font-medium text-muted-foreground ${TYPE_COLORS[programme.type]}`}
        >
          {TYPE_LABELS[programme.type]}
        </Badge>
      ),
    },
    {
      label: "Enrolled",
      content: (
        <p className="text-sm font-medium text-foreground">
          {programme.enrolledCount} / {programme.capacity}
        </p>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {programme.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {programme.levelName} · Ages {programme.minAge}–{programme.maxAge}
          </p>
        </div>
        <EnrollmentSheet programme={programme} />
      </div>

      <PropertyGrid items={gridItems} />

      <div className="flex flex-wrap gap-2">
        {programme.coaches && programme.coaches.length > 0 && (
          <Badge className="bg-tertiary gap-1.5 rounded-md border-transparent px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-none">
            <Users className="h-3.5 w-3.5" />
            {programme.coaches.length} coach
            {programme.coaches.length > 1 ? "es" : ""}
          </Badge>
        )}
        {programme.upcomingSessions > 0 && (
          <Badge className="bg-tertiary gap-1.5 rounded-md border-transparent px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-none">
            <Calendar className="h-3.5 w-3.5" />
            {programme.upcomingSessions} upcoming
          </Badge>
        )}
        <Badge className="bg-tertiary gap-1.5 rounded-md border-transparent px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-none">
          <Target className="h-3.5 w-3.5" />
          Max ratio 1:{programme.maxRatio}
        </Badge>
      </div>

      <div className="prose max-w-none">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {programme.description}
        </p>
        {programme.stageGoal && (
          <div className="relative mt-4 overflow-hidden rounded-lg bg-secondary p-4 shadow">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-9 -bottom-6 h-12 w-12 rotate-45 rounded-lg bg-card"
            />

            <p className="text-xs font-medium tracking-wider text-primary uppercase">
              Goal
            </p>
            <p className="text-sm text-foreground">{programme.stageGoal}</p>
          </div>
        )}
      </div>
    </div>
  )
}
