"use client"

import { format } from "date-fns"
import { Section } from "./member-detail-sections"

export function ProgressTab({
  level,
  progressions,
}: {
  level: { name: string; goal?: string | null } | null
  progressions: {
    id: number
    level_id: number
    notes: string | null
    badge_complete: boolean
    created_at: string
  }[]
}) {
  return (
    <>
      <Section title="Current level">
        {level ? (
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold tracking-tight text-foreground">
              {level.name}
            </span>
            {level.goal && (
              <span className="text-xs leading-relaxed text-muted-foreground">
                {level.goal}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No level assigned.</p>
        )}
      </Section>

      <Section
        title="Progression history"
        description="Every level change and badge submission."
      >
        {progressions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No progression recorded.
          </p>
        ) : (
          <div className="flex flex-col">
            {progressions.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    Level {p.level_id}
                  </span>
                  {p.notes && (
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {p.notes}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {p.badge_complete && (
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Badge complete
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(p.created_at), "d MMM yyyy")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  )
}
