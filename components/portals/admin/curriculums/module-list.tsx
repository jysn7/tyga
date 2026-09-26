"use client"

import { useState } from "react"
import { Pencil, Archive, ArchiveRestore, Trash2, BookOpen } from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { toast } from "@/components/ui/toast"
import {
  useToggleModuleArchive,
  useDeleteCurriculumModule,
} from "@/hooks/admin/curriculums/use-curriculum-module-mutations"
import type { CurriculumModule } from "@/hooks/admin/curriculums/use-curriculum-modules"

const CATEGORY_LABELS: Record<
  NonNullable<CurriculumModule["category"]>,
  string
> = {
  technical: "Technical",
  physical: "Physical",
  mental_character: "Mental & character",
  format: "Format",
}

const CATEGORY_STYLES: Record<
  NonNullable<CurriculumModule["category"]>,
  string
> = {
  technical: "bg-teal",
  physical: "bg-yellow",
  mental_character: "bg-purple",
  format: "bg-orange",
}

export function ModuleList({
  modules,
  onEdit,
}: {
  modules: CurriculumModule[]
  onEdit: (module: CurriculumModule) => void
}) {
  const toggleArchive = useToggleModuleArchive()
  const deleteModule = useDeleteCurriculumModule()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleToggleArchive(module: CurriculumModule) {
    try {
      await toggleArchive.mutateAsync({
        id: module.id,
        archived: module.archivedAt !== null,
      })
      toast.add({
        title: module.archivedAt ? "Module restored" : "Module archived",
        type: "success",
        timeout: 4000,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to update module",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleDelete(module: CurriculumModule) {
    setDeletingId(module.id)
    try {
      await deleteModule.mutateAsync(module.id)
      toast.add({ title: "Module deleted", type: "success", timeout: 4000 })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Cannot delete module",
        description: message,
        type: "error",
        timeout: 6000,
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (modules.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No modules yet"
        description="Add curriculum modules to define what's taught at this level."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-card shadow">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-border/60 bg-foreground/80 text-left text-[11px] font-medium tracking-wider text-background uppercase">
            <th className="px-4 py-2 font-medium">Module</th>
            <th className="px-4 py-2 font-medium">Level</th>
            <th className="px-4 py-2 font-medium">Category</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => {
            const isArchived = module.archivedAt !== null
            return (
              <tr
                key={module.id}
                className={`border-b border-border/60 text-sm transition-colors last:border-b-0 hover:bg-accent/40 ${
                  isArchived ? "opacity-50" : ""
                }`}
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                      {module.name}
                    </span>
                    {module.isMilestone && (
                      <span className="inline-flex items-center rounded-full bg-pink px-2 py-0.5 text-[10px] font-medium text-secondary">
                        Milestone
                      </span>
                    )}
                    {isArchived && (
                      <span className="inline-flex items-center rounded-full bg-input px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Archived
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                  {module.levelName}
                </td>

                <td className="px-4 py-2 whitespace-nowrap">
                  {module.category ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-secondary ${
                        CATEGORY_STYLES[module.category]
                      }`}
                    >
                      {CATEGORY_LABELS[module.category]}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>

                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(module)}
                      title="Edit"
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(module)}
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
                      onClick={() => handleDelete(module)}
                      disabled={deletingId === module.id}
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
