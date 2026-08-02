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
    <aside className="sticky top-6 space-y-4 text-xs">
      {/* Main Block */}
      <div className="bg-tertiary/50 space-y-4 rounded-md border border-border/80 p-4">
        {/* Price Property */}
        <div className="flex items-baseline justify-between">
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

        <Separator className="bg-border/60" />

        <div className="space-y-2.5">
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

        <Separator className="bg-border/60" />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Enrollment</span>
            <span className="font-medium text-foreground">
              {programme.enrolledCount}/{programme.capacity}
            </span>
          </div>

          <Progress
            value={enrollmentPercentage}
            className={`h-1.5 rounded-full ${
              isFull
                ? "bg-destructive/20"
                : spotsLeft <= 2
                  ? "bg-accent"
                  : "bg-muted"
            }`}
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

        <EnrollmentSheet programme={programme} fullWidthTrigger />
      </div>

      {programme.venueMap && (
        <a
          href={programme.venueMap}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-tertiary/30 hover:bg-tertiary flex items-center justify-between rounded-md border border-border/80 p-3 text-xs text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            View on Google Maps
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      )}

      {/* Contact Section Block */}
      {(programme.contactEmail || programme.contactPhone) && (
        <div className="bg-tertiary/30 space-y-2 rounded-md border border-border/80 p-3 text-xs">
          <p className="font-normal text-muted-foreground">Contact</p>
          <div className="space-y-1.5">
            {programme.contactEmail && (
              <a
                href={`mailto:${programme.contactEmail}`}
                className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{programme.contactEmail}</span>
              </a>
            )}
            {programme.contactPhone && (
              <a
                href={`tel:${programme.contactPhone}`}
                className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{programme.contactPhone}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
