"use client"

import { useState } from "react"
import { MapPin, Pencil } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { VenueFormPanel } from "@/components/portals/admin/venues/venue-form-panel"
import { EmptyState } from "@/components/portals/shared/empty-state"
import type { AdminVenue } from "@/hooks/admin/venues/use-venues"

const typeLabel: Record<string, string> = {
  course: "Course",
  practice_ground: "Practice ground",
  range: "Driving range",
  school: "School facility",
}

const typeColors: Record<string, string> = {
  course: "bg-green/15 text-green",
  practice_ground: "bg-blue/15 text-blue",
  range: "bg-orange/15 text-orange",
  school: "bg-purple/15 text-purple",
}

export function VenueTable({ venues }: { venues: AdminVenue[] }) {
  const [editingVenue, setEditingVenue] = useState<AdminVenue | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  function handleEdit(venue: AdminVenue) {
    setEditingVenue(venue)
    setEditOpen(true)
  }

  if (venues.length === 0) {
    return (
      <EmptyState
        title="No venues yet"
        description="Add your first venue to get started."
      />
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg bg-card shadow">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Venue</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {venues.map((venue) => (
              <TableRow
                key={venue.id}
                className="group cursor-pointer transition-colors"
                onClick={() => handleEdit(venue)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue">
                      <MapPin
                        className="h-3.5 w-3.5 text-foreground"
                        strokeWidth={1.75}
                      />
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                      {venue.name}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {venue.address || "No address provided"}
                  </span>
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                      typeColors[venue.type ?? ""] ||
                      "bg-input text-muted-foreground"
                    }`}
                  >
                    {typeLabel[venue.type ?? ""] ?? venue.type ?? "Unknown"}
                  </span>
                </TableCell>

                <TableCell>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(venue)
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="Edit venue"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <VenueFormPanel
        key={`${editingVenue?.id ?? "new"}-${editOpen ? "open" : "closed"}`}
        venue={editingVenue}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
