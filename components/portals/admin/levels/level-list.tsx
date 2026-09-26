"use client"

import { useState } from "react"
import {
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  GraduationCap,
} from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { toast } from "@/components/ui/toast"
import {
  useToggleLevelArchive,
  useDeleteLevel,
} from "@/hooks/admin/levels/use-level-mutations"
import type { Level } from "@/hooks/admin/levels/use-levels"

export function LevelList({
  levels,
  onEdit,
}: {
  levels: Level[]
  onEdit: (level: Level) => void
}) {
  const toggleArchive = useToggleLevelArchive()
  const deleteLevel = useDeleteLevel()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleToggleArchive(level: Level) {
    try {
      await toggleArchive.mutateAsync({
        id: level.id,
        archived: level.archivedAt !== null,
      })
      toast.add({
        title: level.archivedAt ? "Level restored" : "Level archived",
        type: "success",
        timeout: 4000,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to update level",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleDelete(level: Level) {
    setDeletingId(level.id)
    try {
      await deleteLevel.mutateAsync(level.id)
      toast.add({ title: "Level deleted", type: "success", timeout: 4000 })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Cannot delete level",
        description: message,
        type: "error",
        timeout: 6000,
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (levels.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No levels yet"
        description="Create your first skill level to start structuring programmes."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-card shadow">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-border/60 bg-foreground/80 text-left text-[11px] font-medium tracking-wider text-background uppercase">
            <th className="px-4 py-2 font-medium">Level</th>
            <th className="px-4 py-2 font-medium">Age range</th>
            <th className="px-4 py-2 font-medium">Goal</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {levels.map((level) => {
            const isArchived = level.archivedAt !== null
            return (
              <tr
                key={level.id}
                className={`border-b border-border/60 text-sm transition-colors last:border-b-0 hover:bg-accent/40 ${
                  isArchived ? "opacity-50" : ""
                }`}
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                      {level.name}
                    </span>
                    {isArchived && (
                      <span className="rounded-full bg-input px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Archived
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                  {level.defaultAgeMin && level.defaultAgeMax
                    ? `${level.defaultAgeMin}–${level.defaultAgeMax}`
                    : "—"}
                </td>

                <td className="max-w-xs truncate px-4 py-2 text-muted-foreground">
                  {level.goal ?? "—"}
                </td>

                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(level)}
                      title="Edit"
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(level)}
                      title={isArchived ? "Restore" : "Archive"}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {isArchived ? (
                        <ArchiveRestore
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <Archive className="h-3.5 w-3.5" strokeWidth={1.75} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(level)}
                      disabled={deletingId === level.id}
                      title="Delete permanently"
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
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
