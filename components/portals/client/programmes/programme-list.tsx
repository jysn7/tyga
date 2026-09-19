import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users } from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import type { ProgrammeListItem } from "@/lib/types"

export function ProgrammeList({
  programmes,
  onEnroll,
}: {
  programmes: ProgrammeListItem[]
  onEnroll: (programme: ProgrammeListItem) => void
}) {
  if (programmes.length === 0) {
    return (
      <EmptyState
        title="No eligible programmes right now"
        description="Check back soon, or contact TYGA if you think this is a mistake."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {programmes.map((p) => {
        const isFull = p.capacity !== null && p.enrolledCount >= p.capacity
        const spotsLeft =
          p.capacity !== null ? p.capacity - p.enrolledCount : null

        return (
          <Card key={p.id} className="rounded-xl border-0 shadow ring-0">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/programmes/${p.id}`}>
                  <CardTitle className="truncate text-base font-semibold tracking-tight text-foreground hover:underline">
                    {p.name}
                  </CardTitle>
                </Link>
                {p.levelName && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-input px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {p.levelName}
                    </span>
                  </div>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className="text-base font-semibold tracking-tight text-foreground">
                  R{p.price}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  / term
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <MapPin
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="truncate text-muted-foreground">
                    {p.venueName}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="truncate text-muted-foreground">
                    {p.recurrenceRule}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span
                    className={
                      isFull
                        ? "font-medium text-destructive"
                        : spotsLeft !== null && spotsLeft <= 2
                          ? "font-medium text-orange"
                          : "text-muted-foreground"
                    }
                  >
                    {isFull
                      ? "Full"
                      : spotsLeft !== null
                        ? `${spotsLeft} spots left`
                        : "Open"}
                  </span>
                </div>
              </div>

              {p.alreadyEnrolled ? (
                <div className="flex h-11 w-full items-center justify-center rounded-lg bg-input text-sm font-medium text-muted-foreground">
                  Already enrolled
                </div>
              ) : (
                <Button
                  disabled={isFull}
                  variant="secondary"
                  className="h-11 w-full text-sm"
                  onClick={() => onEnroll(p)}
                >
                  {isFull ? "Programme full" : "Enrol"}
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
