"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useDeleteVenue } from "@/hooks/admin/venues/use-venue-mutations"
import type { AdminVenue } from "@/hooks/admin/venues/use-venues"

const TYPE_LABELS: Record<AdminVenue["type"], string> = {
  course: "Course",
  practice_ground: "Practice ground",
  range: "Driving range",
  school: "School facility",
}

const TYPE_STYLES: Record<AdminVenue["type"], string> = {
  course: "bg-green",
  practice_ground: "bg-yellow",
  range: "bg-orange",
  school: "bg-purple",
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
    <tr className="border-b border-border/60 text-sm transition-colors last:border-b-0 hover:bg-accent/40">
      {/* Venue */}
      <td className="px-4 py-2">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          {venue.name}
        </span>
      </td>

      {/* Address */}
      <td className="px-4 py-2 text-muted-foreground">
        <span className="line-clamp-1">{venue.address || "—"}</span>
      </td>

      {/* Type */}
      <td className="px-4 py-2 whitespace-nowrap">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-secondary ${TYPE_STYLES[venue.type]}`}
        >
          {TYPE_LABELS[venue.type]}
        </span>
      </td>

      {/* Programmes */}
      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
        {venue.programmeCount}{" "}
        <span className="text-xs">
          programme{venue.programmeCount === 1 ? "" : "s"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-2">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(venue)}
            title="Edit"
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete()}
            disabled={deleting}
            title="Delete"
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  )
}
