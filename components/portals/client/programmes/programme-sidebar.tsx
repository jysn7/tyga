import { MapPin, Clock, Users, ExternalLink, Mail, Phone } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { EnrollmentSheet } from "@/components/portals/client/programmes/enrollment-sheet"
import type { ProgrammeDetail } from "@/lib/data/programmes"

export function ProgrammeSidebar({
  programme,
}: {
  programme: ProgrammeDetail
}) {
  const isFull = programme.enrolledCount >= programme.capacity
  const spotsLeft = programme.capacity - programme.enrolledCount
  const enrollmentPercentage =
    (programme.enrolledCount / programme.capacity) * 100

  return (
    <aside className="sticky top-6 flex flex-col gap-5 text-xs">
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 shadow">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-7 -bottom-8 h-14 w-14 rotate-45 rounded-lg bg-secondary"
        />

        <div className="relative flex items-baseline justify-between">
          <span className="font-normal text-muted-foreground">Price</span>
          <div className="text-right">
            <span className="text-base font-semibold text-foreground">
              R{programme.price}
            </span>
            <span className="ml-1 font-normal text-muted-foreground">
              / term
            </span>
          </div>
        </div>

        <Separator className="relative bg-border/40" />

        <div className="relative flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5 text-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="leading-tight">{programme.venueName}</span>
          </div>

          <div className="flex items-start gap-2.5 text-foreground">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="leading-tight">{programme.recurrenceRule}</span>
          </div>

          <div className="flex items-start gap-2.5 text-foreground">
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="leading-tight">
              <span>
                Ages {programme.minAge}–{programme.maxAge}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Coach ratio 1:{programme.maxRatio}
              </span>
            </div>
          </div>
        </div>

        <Separator className="relative bg-border/40" />

        <div className="relative flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Enrollment</span>
            <span className="font-medium text-foreground">
              {programme.enrolledCount}/{programme.capacity}
            </span>
          </div>

          <Progress
            value={enrollmentPercentage}
            className="h-1.5 rounded-full bg-input"
            indicatorClassName={
              isFull
                ? "bg-destructive"
                : spotsLeft <= 2
                  ? "bg-secondary-foreground"
                  : "bg-primary"
            }
          />

          <div className="flex items-center justify-between text-xs">
            {isFull ? (
              <span className="font-medium text-destructive">
                Programme full
              </span>
            ) : spotsLeft <= 2 ? (
              <span className="font-medium text-secondary-foreground">
                {spotsLeft} spots remaining
              </span>
            ) : (
              <span className="text-muted-foreground">
                {spotsLeft} spots available
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <EnrollmentSheet programme={programme} fullWidthTrigger />
        </div>
      </div>

      {(programme.venueMap ||
        programme.contactEmail ||
        programme.contactPhone) && (
        <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
          {programme.venueMap && (
            <a
              href={programme.venueMap}
              target="_blank"
              rel="noopener noreferrer"
              className="text-information hover:text-information/70 flex items-center justify-between underline transition-colors"
            >
              <span className="text-information flex items-center gap-2">
                <MapPin className="text-foreground-muted h-3.5 w-3.5" />
                View on Google Maps
              </span>
              <ExternalLink className="text-information h-3.5 w-3.5" />
            </a>
          )}

          {(programme.contactEmail || programme.contactPhone) && (
            <div className="flex flex-col gap-1.5">
              <p className="font-normal text-muted-foreground">Contact</p>
              {programme.contactEmail && (
                <a
                  href={`mailto:${programme.contactEmail}`}
                  className="text-information hover:text-information/70 flex items-center gap-2 underline transition-colors"
                >
                  <Mail className="text-foreground-muted h-3.5 w-3.5" />
                  <span className="truncate">{programme.contactEmail}</span>
                </a>
              )}
              {programme.contactPhone && (
                <a
                  href={`tel:${programme.contactPhone}`}
                  className="text-information hover:text-information/70 flex items-center gap-2 underline transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{programme.contactPhone}</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
