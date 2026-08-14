"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { ModuleList } from "@/components/portals/admin/curriculums/module-list"
import { ModulePanel } from "@/components/portals/admin/curriculums/module-panel"
import {
  useCurriculumModules,
  type CurriculumModule,
} from "@/hooks/admin/curriculums/use-curriculum-modules"
import { useLevels } from "@/hooks/admin/levels/use-levels"
import { Loader } from "@/components/portals/shared/loader"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminCurriculumPage() {
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const { data: levels } = useLevels()
  const {
    data: modules,
    isLoading,
    error,
  } = useCurriculumModules(
    levelFilter === "all" ? undefined : Number(levelFilter)
  )

  const [panelOpen, setPanelOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<CurriculumModule | null>(
    null
  )

  function handleCreate() {
    setEditingModule(null)
    setPanelOpen(true)
  }

  function handleEdit(module: CurriculumModule) {
    setEditingModule(module)
    setPanelOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Curriculum"
        description="Modules taught within each skill level"
        action={
          <Button
            size="sm"
            className="gap-1.5 rounded-lg text-xs"
            onClick={handleCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            New module
          </Button>
        }
      />

      <Select
        value={levelFilter}
        onValueChange={(value) => setLevelFilter(value ?? "all")}
      >
        <SelectTrigger className="h-9 w-full text-sm sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All levels</SelectItem>
          {(levels ?? []).map((l) => (
            <SelectItem key={l.id} value={l.id.toString()}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="flex h-full w-full justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Error: {error.message}</div>
      ) : (
        <ModuleList modules={modules ?? []} onEdit={handleEdit} />
      )}

      <ModulePanel
        key={
          editingModule
            ? `module-${editingModule.id}`
            : `new-module-${levelFilter}`
        }
        module={editingModule}
        levels={levels ?? []}
        defaultLevelId={levelFilter !== "all" ? Number(levelFilter) : undefined}
        onOpenChange={setPanelOpen}
        open={panelOpen}
      />
    </div>
  )
}
