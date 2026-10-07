"use client"

import { useMemo, useState } from "react"
import { Check, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Loader } from "@/components/portals/shared/loader"
import { SessionLockBanner } from "@/components/portals/shared/coach/session-lock-banner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useCoachSessionCurriculum } from "@/hooks/coach/use-sessions"
import {
  useSaveSessionNotes,
  useTagSessionCurriculum,
} from "@/hooks/coach/use-sessions-mutations"

export function SessionNotesTab({
  sessionId,
  initialNotes,
  readOnly,
  isCancelled,
}: {
  sessionId: number
  initialNotes: string
  readOnly: boolean
  isCancelled: boolean
}) {
  const {
    data: modules,
    isLoading: modulesLoading,
    error: modulesError,
    refetch: refetchModules,
  } = useCoachSessionCurriculum(sessionId)
  const saveNotes = useSaveSessionNotes()
  const saveCurriculum = useTagSessionCurriculum()
  const [notes, setNotes] = useState(initialNotes)
  const [selectionOverrides, setSelectionOverrides] = useState<
    Record<number, boolean>
  >({})

  const taggedModuleIds = useMemo(
    () =>
      new Set(
        modules?.filter((module) => module.is_tagged).map((m) => m.module_id) ??
          []
      ),
    [modules]
  )

  const selectedModuleIds = useMemo(() => {
    const selected = new Set(taggedModuleIds)
    for (const [moduleId, isSelected] of Object.entries(selectionOverrides)) {
      const id = Number(moduleId)
      if (isSelected) selected.add(id)
      else selected.delete(id)
    }
    return selected
  }, [selectionOverrides, taggedModuleIds])

  function toggleModule(moduleId: number) {
    if (taggedModuleIds.has(moduleId)) return

    const nextValue = !selectionOverrides[moduleId]
    setSelectionOverrides((current) => {
      const next = { ...current }
      if (nextValue) next[moduleId] = true
      else delete next[moduleId]
      return next
    })
  }

  function handleSaveNotes() {
    saveNotes.mutate(
      { sessionId, notes },
      {
        onSuccess: () =>
          toast.add({
            title: "Session notes saved",
            type: "success",
            timeout: 3000,
          }),
        onError: (error) =>
          toast.add({
            title: "Notes not saved",
            description:
              error instanceof Error ? error.message : "Something went wrong.",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  function handleSaveCurriculum() {
    saveCurriculum.mutate(
      {
        sessionId,
        moduleIds: Array.from(selectedModuleIds).filter(
          (moduleId) => !taggedModuleIds.has(moduleId)
        ),
      },
      {
        onSuccess: () => {
          setSelectionOverrides({})
          toast.add({
            title: "Curriculum saved",
            type: "success",
            timeout: 3000,
          })
        },
        onError: (error) =>
          toast.add({
            title: "Curriculum not saved",
            description:
              error instanceof Error ? error.message : "Something went wrong.",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <SessionLockBanner readOnly={readOnly} isCancelled={isCancelled} />

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Curriculum covered
          </h2>
          {!modulesLoading && (
            <span className="text-xs text-muted-foreground">
              {selectedModuleIds.size} of {modules?.length ?? 0} tagged
            </span>
          )}
        </div>

        {modulesLoading ? (
          <div className="flex h-32 items-center justify-center rounded-xl bg-card shadow">
            <Loader />
          </div>
        ) : modulesError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
          >
            <span>Could not load curriculum: {modulesError.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetchModules()}
            >
              Retry
            </Button>
          </div>
        ) : !modules?.length ? (
          <EmptyState
            title="No curriculum modules"
            description="There are no modules available for this programme level."
          />
        ) : (
          <>
            <ul className="overflow-hidden rounded-xl bg-card shadow">
              {modules.map((module) => {
                const isSelected = selectedModuleIds.has(module.module_id)
                return (
                  <li
                    key={module.module_id}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      disabled={
                        readOnly || saveCurriculum.isPending || module.is_tagged
                      }
                      onClick={() => toggleModule(module.module_id)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {isSelected && (
                            <Check
                              className="h-3 w-3"
                              strokeWidth={2.5}
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-sm text-foreground">
                            {module.module_name}
                          </span>
                          {module.category && (
                            <span className="text-xs text-muted-foreground capitalize">
                              {module.category.replaceAll("_", " ")}
                            </span>
                          )}
                        </span>
                      </span>
                      {module.is_tagged && (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          Saved
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>

            {!readOnly && (
              <Button
                onClick={handleSaveCurriculum}
                disabled={
                  saveCurriculum.isPending ||
                  Object.keys(selectionOverrides).length === 0
                }
                className="h-10 w-fit gap-2"
              >
                {saveCurriculum.isPending ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                Save curriculum
              </Button>
            )}
          </>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Session notes
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Record observations and follow-up notes for this session.
          </p>
        </div>
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={readOnly || saveNotes.isPending}
          placeholder="What happened in this session?"
          className="min-h-32 resize-y rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0 disabled:opacity-50"
        />
        {!readOnly && (
          <Button
            onClick={handleSaveNotes}
            disabled={saveNotes.isPending || notes === initialNotes}
            className="h-10 w-fit gap-2"
          >
            {saveNotes.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Save notes
          </Button>
        )}
      </section>
    </div>
  )
}
