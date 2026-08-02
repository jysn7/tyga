import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface ProgrammeSession {
  date: string
  startTime: string
  endTime: string
  status: string
}

export function SessionsList({ sessions }: { sessions: ProgrammeSession[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">
        Upcoming Sessions
      </h2>
      <div className="space-y-2">
        {sessions.slice(0, 5).map((session) => (
          <div
            key={session.date}
            className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div className="bg-tertiary rounded-md p-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {new Date(session.date).toLocaleDateString("en-ZA", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.startTime} – {session.endTime}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-tertiary rounded-md border-transparent text-[10px] font-medium text-muted-foreground capitalize shadow-none"
            >
              {session.status}
            </Badge>
          </div>
        ))}
        {sessions.length > 5 && (
          <p className="text-center text-xs text-muted-foreground">
            +{sessions.length - 5} more sessions
          </p>
        )}
      </div>
    </div>
  )
}
