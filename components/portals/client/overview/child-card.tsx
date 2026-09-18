import { Clock, MapPin, TrendingUp, Trophy } from "lucide-react"
import type { ChildSummary } from "@/hooks/client/use-parent-overview"

const ACCENTS = [
  { wash: "bg-blue/60", text: "text-foreground" },
  { wash: "bg-pink/60", text: "text-foreground" },
  { wash: "bg-orange/60", text: "text-foreground" },
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
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${accent.wash} text-sm font-semibold ${accent.text}`}
        >
          {child.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {child.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {child.age} years · {child.level ?? "Not yet assessed"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border-2 border-border p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          <Clock className="h-3 w-3" />
          Next session
        </div>
        <p className="text-sm font-medium text-foreground">
          {child.nextSession ?? "None scheduled"}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{child.venue ?? "—"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5 rounded-lg border-2 border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            <TrendingUp className="h-3 w-3" />
            Attendance
          </div>
          <span className="text-lg font-semibold text-foreground">
            {child.attendance}%
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg border-2 border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            <Trophy className="h-3 w-3" />
            Badges
          </div>
          <span className="text-lg font-semibold text-foreground">
            {child.badges}
          </span>
        </div>
      </div>
    </div>
  )
}
