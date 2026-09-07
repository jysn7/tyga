import { VenueCard } from "@/components/portals/admin/venues/venue-card"
import { EmptyState } from "@/components/portals/shared/empty-state"
import type { Venue } from "@/lib/types"
import { MapPin } from "lucide-react"

export function VenueList({ venues }: { venues: Venue[] }) {
  if (venues.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No venues yet"
        description="Add your first venue to get started."
      />
    )
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Venues ({venues.length})
        </p>
      </div>
      <div className="divide-y divide-border/60 px-4">
        {venues.map((v) => (
          <VenueCard key={v.id} venue={v} />
        ))}
      </div>
    </div>
  )
}
