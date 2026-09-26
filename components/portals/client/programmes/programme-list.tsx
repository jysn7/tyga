import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users, GraduationCap } from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import type { ProgrammeListItem } from "@/lib/types"

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + "…"
}

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
          <div key={p.id} className="overflow-hidden rounded-lg bg-card shadow">
            {/* Cover image with overlay */}
            <Link href={`/programmes/${p.id}`} className="block">
              <div className="relative aspect-16/5 w-full overflow-hidden bg-muted">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-light">
                    <GraduationCap
                      className="h-6 w-6 text-blue"
                      strokeWidth={1.75}
                    />
                  </div>
                )}

                {/* Dark gradient bottom → middle */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-foreground/40 to-transparent" />

                {/* Level chip over the image */}
                {p.levelName && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded-md bg-background/85 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
                      {p.levelName}
                    </span>
                  </div>
                )}

                {/* Name + price pinned to bottom of image */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-3 pb-2.5">
                  <h3 className="line-clamp-1 font-semibold tracking-tight text-background dark:text-foreground">
                    {p.name}
                  </h3>
                  <div className="shrink-0 text-right">
                    <span className="font-semibold tracking-tight text-background dark:text-foreground">
                      R{p.price}
                    </span>
                    <span className="ml-0.5 text-xs text-background/70 dark:text-foreground/80">
                      /term
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Content */}
            <div className="flex flex-col gap-2.5 p-3">
              {/* Description */}
              {p.description ? (
                <p className="font-regular line-clamp-2 text-sm leading-snug text-muted-foreground">
                  {truncate(p.description, 100)}
                </p>
              ) : (
                <p className="text-xs leading-snug text-muted-foreground/60 italic">
                  No description provided.
                </p>
              )}

              {/* Meta rows — stacked */}
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin
                    className="h-3 w-3 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <span className="truncate text-muted-foreground">
                    {p.venueName}
                  </span>
                </div>

                {p.recurrenceRule && (
                  <div className="flex items-center gap-2">
                    <Clock
                      className="h-3 w-3 shrink-0 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                    <span className="truncate text-muted-foreground">
                      {p.recurrenceRule}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Users
                    className="h-3 w-3 shrink-0 text-muted-foreground"
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

              {/* Action */}
              {p.alreadyEnrolled ? (
                <div className="flex h-8 w-full items-center justify-center rounded-md bg-input text-xs font-medium text-muted-foreground">
                  Already enrolled
                </div>
              ) : (
                <Button
                  disabled={isFull}
                  variant="secondary"
                  className="h-8 w-full rounded-md text-xs"
                  onClick={() => onEnroll(p)}
                >
                  {isFull ? "Programme full" : "Enrol"}
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
