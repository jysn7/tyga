"use client"

import { useState } from "react"
import {
  Pencil,
  Archive,
  ArchiveRestore,
  GraduationCap,
  CalendarDays,
} from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { toast } from "@/components/ui/toast"
import { useToggleProgrammeArchive } from "@/hooks/admin/programmes/use-programme-mutations"
import type { AdminProgramme } from "@/hooks/admin/programmes/use-programmes"

const TYPE_LABELS: Record<AdminProgramme["type"], string> = {
  development: "Development",
  weekly_community: "Community",
  holiday_camp: "Holiday Camp",
  clinic: "Clinic",
  corporate: "Corporate",
  league: "League",
}

export function ProgrammeList({
  programmes,
  onEdit,
  onManageSessions,
}: {
  programmes: AdminProgramme[]
  onEdit: (programme: AdminProgramme) => void
  onManageSessions: (programme: AdminProgramme) => void
}) {
  const toggleArchive = useToggleProgrammeArchive()
  const [togglingId, setTogglingId] = useState<number | null>(null)

  async function handleToggleArchive(programme: AdminProgramme) {
    setTogglingId(programme.id)
    try {
      await toggleArchive.mutateAsync({
        id: programme.id,
        archived: programme.archivedAt !== null,
      })
      toast.add({
        title: programme.archivedAt
          ? "Programme restored"
          : "Programme archived",
        type: "success",
        timeout: 4000,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to update programme",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setTogglingId(null)
    }
  }

  if (programmes.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No programmes found"
        description="Create your first programme to start enrolling members."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg bg-card shadow">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border/60 text-left text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            <th className="px-4 py-2.5 font-medium">Programme</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Level</th>
            <th className="px-4 py-2.5 font-medium">Venue</th>
            <th className="px-4 py-2.5 font-medium">Enrolled</th>
            <th className="px-4 py-2.5 font-medium">Price</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {programmes.map((programme) => {
            const isArchived = programme.archivedAt !== null
            const isFull = programme.enrolledCount >= programme.capacity
            return (
              <tr
                key={programme.id}
                className={`border-b border-border/60 text-sm last:border-b-0 hover:bg-accent/40 ${
                  isArchived ? "opacity-50" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium text-foreground">
                      {programme.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ages {programme.minAge}–{programme.maxAge}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                    {TYPE_LABELS[programme.type]}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {programme.levelName ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {programme.venueName ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={
                      isFull
                        ? "font-medium text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    {programme.enrolledCount}/{programme.capacity}
                  </span>
                  {isArchived && (
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      Archived
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  R{programme.price}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onManageSessions(programme)}
                      title="Sessions"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground"
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(programme)}
                      title="Edit"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(programme)}
                      disabled={togglingId === programme.id}
                      title={isArchived ? "Restore" : "Archive"}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                    >
                      {isArchived ? (
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
