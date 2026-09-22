import { Clock, MapPin, TrendingUp, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ChildSummary } from "@/hooks/client/use-parent-overview"

const ACCENTS = [
  { wash: "bg-blue/15", text: "text-foreground" },
  { wash: "bg-pink/15", text: "text-foreground" },
  { wash: "bg-orange/15", text: "text-foreground" },
]

export function ChildCard({
  child,
  index = 0,
}: {
  child: ChildSummary
  index?: number
}) {
  const accent = ACCENTS[index % ACCENTS.length]

  return (
    <Link
      href={`/members/${child.id}`}
      className="group flex flex-col gap-4 rounded-xl bg-card p-5 shadow transition-colors hover:bg-accent/20"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accent.wash} text-sm font-semibold ${accent.text}`}
        >
          {child.initials}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            {child.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {child.age} years · {child.level ?? "Not yet assessed"}
          </span>
        </div>
        <ArrowRight
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          strokeWidth={1.75}
        />
      </div>

      <div className="h-px bg-border/60" />

      {/* Next session */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-input">
            <Clock
              className="h-3 w-3 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Next session
          </span>
        </div>
        <div className="flex flex-col gap-0.5 pl-8">
          <span className="truncate text-sm font-medium text-foreground">
            {child.nextSession ?? "None scheduled"}
          </span>
          {child.nextProgramme && (
            <span className="truncate text-xs text-muted-foreground">
              {child.nextProgramme}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{child.venue ?? "—"}</span>
          </span>
        </div>
      </div>

      <div className="h-px bg-border/60" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp
              className="h-3 w-3 text-muted-foreground"
              strokeWidth={1.75}
            />
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Attendance
            </span>
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            {child.attendance}%
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Trophy
              className="h-3 w-3 text-muted-foreground"
              strokeWidth={1.75}
            />
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Badges
            </span>
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            {child.badges}
          </span>
        </div>
      </div>
    </Link>
  )
}
