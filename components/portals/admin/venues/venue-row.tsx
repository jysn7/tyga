"use client"

import { useState } from "react"
import { MapPin, Pencil, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useDeleteVenue } from "@/hooks/admin/venues/use-venue-mutations"
import type { AdminVenue } from "@/hooks/admin/venues/use-venues"

const TYPE_LABELS: Record<AdminVenue["type"], string> = {
  course: "Course",
  practice_ground: "Practice ground",
  range: "Driving range",
  school: "School facility",
}

export function VenueRow({
  venue,
  onEdit,
}: {
  venue: AdminVenue
  onEdit: (venue: AdminVenue) => void
}) {
  const deleteVenue = useDeleteVenue()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Delete "${venue.name}"? This cannot be undone.`))
      return
    setDeleting(true)
    try {
      await deleteVenue.mutateAsync(venue.id)
      toast.add({ title: "Venue deleted", type: "success", timeout: 4000 })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Cannot delete venue",
        description: message,
        type: "error",
        timeout: 6000,
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <tr className="border-b border-border/60 text-sm last:border-b-0 hover:bg-accent/40">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue/40">
            <MapPin className="h-3.5 w-3.5 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{venue.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {venue.address}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {TYPE_LABELS[venue.type]}
      </td>

      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {venue.programmeCount} programme{venue.programmeCount === 1 ? "" : "s"}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(venue)}
            title="Edit"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}
