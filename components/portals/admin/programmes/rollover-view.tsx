"use client"

import { useMemo, useState } from "react"
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  ArrowRight,
  Users,
} from "lucide-react"
import { Loader } from "@/components/portals/shared/loader"
import { useProgrammes } from "@/hooks/admin/programmes/use-programmes"
import type { AdminProgramme } from "@/hooks/admin/programmes/use-programmes"
import { useWaitlistCounts } from "@/hooks/admin/programmes/use-waitlist"
import { RolloverProgrammeDialog } from "./rollover-dialog"
import { ProgrammeWaitlistDialog } from "./waitlist-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Bucket = "due" | "ending" | "upcoming"

function bucketFor(programme: AdminProgramme): Bucket | null {
  if (programme.archivedAt) return null
  if (!programme.termEnd) return null
  const end = new Date(programme.termEnd)
  const today = new Date()
  const daysUntilEnd = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysUntilEnd < 0) return "due"
  if (daysUntilEnd <= 14) return "ending"
  return "upcoming"
}

const BUCKET_META: Record<
  Bucket,
  { label: string; description: string; accent: string; icon: typeof Archive }
> = {
  due: {
    label: "Term ended",
    description:
      "These programmes have finished. Roll them over to open the next term.",
    accent: "text-destructive",
    icon: Archive,
  },
  ending: {
    label: "Ending within 2 weeks",
    description: "You may want to prepare the next term now.",
    accent: "text-amber-600 dark:text-amber-500",
    icon: CalendarClock,
  },
  upcoming: {
    label: "Upcoming",
    description: "These terms are still running. Roll over when they end.",
    accent: "text-muted-foreground",
    icon: CalendarClock,
  },
}

export function RolloverView() {
  const { data: programmes, isLoading } = useProgrammes({ archived: false })
  const { data: waitlistCounts = {} } = useWaitlistCounts()
  const [source, setSource] = useState<AdminProgramme | null>(null)
  const [waitlistProgramme, setWaitlistProgramme] =
    useState<AdminProgramme | null>(null)

  const grouped = useMemo(() => {
    const groups: Record<Bucket, AdminProgramme[]> = {
      due: [],
      ending: [],
      upcoming: [],
    }
    for (const p of programmes ?? []) {
      const bucket = bucketFor(p)
      if (bucket) groups[bucket].push(p)
    }
    // Sort each bucket by term_end ascending (soonest first)
    for (const k of Object.keys(groups) as Bucket[]) {
      groups[k].sort((a, b) => (a.termEnd ?? "").localeCompare(b.termEnd ?? ""))
    }
    return groups
  }, [programmes])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader />
      </div>
    )
  }

  const totalRelevant =
    grouped.due.length + grouped.ending.length + grouped.upcoming.length

  if (totalRelevant === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="mt-3 text-sm font-medium text-foreground">
          Nothing to roll over
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Programmes will appear here as their term end dates approach.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {(["due", "ending", "upcoming"] as Bucket[]).map((bucket) => {
        const items = grouped[bucket]
        if (items.length === 0) return null
        const meta = BUCKET_META[bucket]
        const Icon = meta.icon
        return (
          <section key={bucket} className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.accent)} />
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-medium text-foreground">
                  {meta.label}{" "}
                  <span className="text-muted-foreground">
                    ({items.length})
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {meta.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((programme) => {
                const waiting = waitlistCounts[programme.id] ?? 0
                return (
                  <div
                    key={programme.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 shadow"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium text-foreground">
                        {programme.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Term ends{" "}
                        {programme.termEnd
                          ? new Date(programme.termEnd).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "—"}
                        {programme.venueName && <> · {programme.venueName}</>}
                        {programme.levelName && <> · {programme.levelName}</>}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {waiting > 0 && (
                        <button
                          type="button"
                          onClick={() => setWaitlistProgramme(programme)}
                          className="inline-flex items-center gap-1 rounded-full bg-orange-light px-2.5 py-1 text-[11px] font-medium text-orange transition-opacity hover:opacity-80"
                          title="View waitlist"
                        >
                          <Users className="h-3 w-3" strokeWidth={1.75} />
                          {waiting} waiting
                        </button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSource(programme)}
                      >
                        Roll over
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <RolloverProgrammeDialog
        sourceProgramme={source}
        open={!!source}
        onOpenChange={(open) => {
          if (!open) setSource(null)
        }}
      />

      <ProgrammeWaitlistDialog
        programme={waitlistProgramme}
        open={!!waitlistProgramme}
        onOpenChange={(open) => {
          if (!open) setWaitlistProgramme(null)
        }}
      />
    </div>
  )
}
