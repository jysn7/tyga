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
import { BookOpen, CalendarDays, Layers } from "lucide-react"

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

  const modulesForSession = sessionModules || []

  return (
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-input">
          <BookOpen
            className="h-3.5 w-3.5 text-muted-foreground"
            strokeWidth={1.75}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Curriculum management
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Tag modules to a session to track what was taught.
          </p>
        </div>
      </div>

      {/* Tag form */}
      <div className="flex flex-col gap-3">
        {/* Session picker */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Session
          </span>
          <Select
            value={selectedSessionId}
            onValueChange={(value) => setSelectedSessionId(value ?? "")}
          >
            <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0">
              <SelectValue placeholder="Select a session…" />
            </SelectTrigger>
            <SelectContent>
              {sessions?.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  <span className="flex items-center gap-2">
                    <CalendarDays
                      className="h-3.5 w-3.5 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                    {new Date(s.sessionDate).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    <span className="text-muted-foreground">
                      · {s.startTime?.slice(0, 5)}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Module picker + action */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Module
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={selectedModuleIds[0] || ""}
              onValueChange={(v) => setSelectedModuleIds(v ? [v] : [])}
            >
              <SelectTrigger className="h-11 flex-1 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0">
                <SelectValue placeholder="Select a module…" />
              </SelectTrigger>
              <SelectContent>
                {levels
                  .flatMap((l) => l.modules || [])
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      <span className="flex items-center gap-2">
                        <Layers
                          className="h-3.5 w-3.5 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                        {m.name}
                      </span>
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
              className="h-11 shrink-0 px-5 text-sm"
            >
              {tagModules.isPending ? "Tagging…" : "Tag module"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tagged modules list */}
      <div className="flex flex-col gap-3 border-t border-border/60 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Tagged modules
          </span>
          <span className="rounded-md bg-input px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {modulesForSession.length}
          </span>
        </div>

        {sessionModules === undefined ? (
          <Loader />
        ) : modulesForSession.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-6 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-input">
              <BookOpen
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">
                No modules tagged
              </span>
              <span className="text-xs text-muted-foreground">
                Tag a module above to track what was taught.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {modulesForSession.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3.5 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-input">
                    <Layers
                      className="h-3 w-3 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className="truncate text-sm text-foreground">
                    {m.name}
                  </span>
                </div>
                <span className="shrink-0 rounded-md bg-input px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
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
