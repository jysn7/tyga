"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { toast } from "@/components/ui/toast"
import { useTagSessionCurriculum } from "@/hooks/admin/programmes/use-programme-mutations"
import type { Level } from "@/hooks/admin/levels/use-levels"
import type {
  Session,
  SessionModule,
} from "@/hooks/admin/programmes/use-programmes"

export function CurriculumSection({
  levels,
  sessions,
  sessionModules,
  onModulesChange,
}: {
  levels: Level[]
  sessions: Session[] | undefined
  sessionModules: SessionModule[] | undefined
  onModulesChange: () => void
}) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([])
  const tagModules = useTagSessionCurriculum()

  async function handleTagModules() {
    if (!selectedSessionId || selectedModuleIds.length === 0) return
    try {
      await tagModules.mutateAsync({
        sessionId: Number(selectedSessionId),
        moduleIds: selectedModuleIds.map(Number),
      })
      toast.add({ title: "Modules tagged", type: "success", timeout: 4000 })
      setSelectedModuleIds([])
      onModulesChange()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to tag modules",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  // Get modules for the selected session
  const modulesForSession = sessionModules || []

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-foreground">
        Curriculum Management
      </h3>

      <div className="flex flex-col gap-3">
        <Select
          value={selectedSessionId}
          onValueChange={(value) => setSelectedSessionId(value ?? "")}
        >
          <SelectTrigger className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
            <SelectValue placeholder="Select a session..." />
          </SelectTrigger>
          <SelectContent>
            {sessions?.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {new Date(s.sessionDate).toLocaleDateString()} - {s.startTime}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2">
          <Select
            value={selectedModuleIds[0] || ""}
            onValueChange={(v) => setSelectedModuleIds(v ? [v] : [])}
          >
            <SelectTrigger className="h-11 flex-1 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
              <SelectValue placeholder="Select a module..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {levels
                .flatMap((l) => l.modules || [])
                .map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleTagModules}
            disabled={
              !selectedSessionId ||
              selectedModuleIds.length === 0 ||
              tagModules.isPending
            }
            className="h-11 px-6 text-sm"
          >
            {tagModules.isPending ? "Tagging..." : "Tag module"}
          </Button>
        </div>
      </div>

      <div className="border-t border-border/60 pt-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Tagged modules ({modulesForSession.length || 0})
        </p>
        {modulesForSession === undefined ? (
          <Loader />
        ) : modulesForSession.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No modules tagged for this session
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {modulesForSession.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm"
              >
                <span>{m.name}</span>
                <span className="text-xs text-muted-foreground">
                  {m.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
