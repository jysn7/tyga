// components/portals/admin/venues/venue-list.tsx — add the programme_count column, drop archived styling
"use client"

import { MapPin } from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { VenueRow } from "./venue-row"
import type { AdminVenue } from "@/hooks/admin/venues/use-venues"

export function VenueList({
  venues,
  onEdit,
}: {
  venues: AdminVenue[]
  onEdit: (venue: AdminVenue) => void
}) {
  if (venues.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No venues found"
        description="Add your first venue to start scheduling programmes there."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg bg-secondary shadow">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border/60 text-left text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            <th className="px-4 py-2.5 font-medium">Venue</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Programmes</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {venues.map((venue) => (
            <VenueRow key={venue.id} venue={venue} onEdit={onEdit} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
