"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { LevelList } from "@/components/portals/admin/levels/level-list"
import { LevelPanel } from "@/components/portals/admin/levels/level-panel"
import { useLevels, type Level } from "@/hooks/admin/levels/use-levels"
import { Loader } from "@/components/portals/shared/loader"
import { Button } from "@/components/ui/button"

export default function AdminLevelsPage() {
  const { data: levels, isLoading, error } = useLevels()
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)

  function handleCreate() {
    setEditingLevel(null)
    setPanelOpen(true)
  }

  function handleEdit(level: Level) {
    setEditingLevel(level)
    setPanelOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Levels"
        description="Skill levels used across programmes and member placement"
        action={
          <Button size="lg" variant="secondary" onClick={handleCreate}>
            <Plus className="h-3.5 w-3.5" />
            New level
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-full w-full justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Error: {error.message}</div>
      ) : (
        <LevelList levels={levels ?? []} onEdit={handleEdit} />
      )}

      <LevelPanel
        key={editingLevel ? `level-${editingLevel.id}` : "new-level"}
        level={editingLevel}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  )
}
