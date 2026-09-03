import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export interface ProgrammeSession {
  date: string
  startTime: string
  endTime: string
  status: string
}

export function SessionsList({ sessions }: { sessions: ProgrammeSession[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">
          Upcoming sessions
        </h2>
        <Link
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          href="/schedule"
        >
          See all
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-input">
            <Calendar
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <p className="text-xs text-muted-foreground">No upcoming sessions</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {sessions.slice(0, 5).map((session) => {
            const dateObj = new Date(session.date)
            return (
              <div
                key={session.date}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-input">
                    <span className="text-[9px] leading-none font-medium text-muted-foreground uppercase">
                      {dateObj.toLocaleDateString("en-ZA", { month: "short" })}
                    </span>
                    <span className="text-sm leading-none font-semibold text-foreground">
                      {dateObj.getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {dateObj.toLocaleDateString("en-ZA", {
                        weekday: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.startTime} – {session.endTime}
                    </p>
                  </div>
                </div>
                <Badge className="rounded-full border-0 bg-input text-[10px] font-medium text-muted-foreground capitalize shadow-none">
                  {session.status}
                </Badge>
              </div>
            )
          })}
          {sessions.length > 5 && (
            <p className="pt-1 text-center text-xs text-muted-foreground">
              +{sessions.length - 5} more sessions
            </p>
          )}
        </div>
      )}
    </div>
  )
}
