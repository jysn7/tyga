"use client"

import { useState } from "react"
import { MapPin, Pencil } from "lucide-react"
import { VenueFormPanel } from "@/components/portals/admin/venues/venue-form-panel"
import type { Venue } from "@/lib/types"

const typeLabel: Record<string, string> = {
  course: "Course",
  practice_ground: "Practice ground",
  range: "Driving range",
  school: "School facility",
}

const typeColors: Record<string, string> = {
  course: "bg-blue/10 text-blue",
  practice_ground: "bg-green/10 text-green",
  range: "bg-orange/10 text-orange",
  school: "bg-pink/10 text-pink",
}

export function VenueCard({ venue }: { venue: Venue }) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <div className="group flex items-center gap-4 border-b border-border/60 py-4 transition-colors hover:bg-muted/30">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/60">
          <MapPin
            className="h-4 w-4 text-muted-foreground"
            strokeWidth={1.75}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{venue.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {venue.address || "No address provided"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${typeColors[venue.type ?? ""] || "bg-muted text-muted-foreground"}`}
          >
            {typeLabel[venue.type ?? ""] ?? venue.type ?? "Unknown"}
          </span>

          <button
            onClick={() => setEditOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-colors group-hover:opacity-100 hover:bg-accent hover:text-foreground"
            title="Edit venue"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <VenueFormPanel
        venue={venue}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
