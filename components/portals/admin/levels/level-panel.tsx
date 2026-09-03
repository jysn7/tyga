"use client"

import { useState } from "react"
import { GraduationCap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field } from "@/components/portals/shared/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  useCreateLevel,
  useUpdateLevel,
} from "@/hooks/admin/levels/use-level-mutations"
import type { Level } from "@/hooks/admin/levels/use-levels"

export function LevelPanel({
  level,
  open,
  onOpenChange,
}: {
  level: Level | null // null = creating a new level
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState(() => level?.name ?? "")
  const [sortOrder, setSortOrder] = useState(
    () => level?.sortOrder?.toString() ?? ""
  )
  const [ageMin, setAgeMin] = useState(
    () => level?.defaultAgeMin?.toString() ?? ""
  )
  const [ageMax, setAgeMax] = useState(
    () => level?.defaultAgeMax?.toString() ?? ""
  )
  const [goal, setGoal] = useState(() => level?.goal ?? "")
  const [focusSummary, setFocusSummary] = useState(
    () => level?.focusSummary ?? ""
  )
  const [upgradeCriteria, setUpgradeCriteria] = useState(
    () => level?.upgradeCriteria ?? ""
  )

  const createLevel = useCreateLevel()
  const updateLevel = useUpdateLevel()
  const isSaving = createLevel.isPending || updateLevel.isPending
  const isEditing = level !== null

  async function handleSubmit() {
    const input = {
      name,
      sortOrder: Number(sortOrder),
      defaultAgeMin: ageMin ? Number(ageMin) : undefined,
      defaultAgeMax: ageMax ? Number(ageMax) : undefined,
      goal: goal || undefined,
      focusSummary: focusSummary || undefined,
      upgradeCriteria: upgradeCriteria || undefined,
    }

    try {
      if (isEditing) {
        await updateLevel.mutateAsync({ ...input, id: level.id })
        toast.add({ title: "Level updated", type: "success", timeout: 4000 })
      } else {
        await createLevel.mutateAsync(input)
        toast.add({ title: "Level created", type: "success", timeout: 4000 })
      }
      onOpenChange(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: isEditing ? "Failed to update level" : "Failed to create level",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-xl [&>button]:top-6 [&>button]:right-6 [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
        <DialogHeader className="flex flex-row items-center gap-3.5 space-y-0 p-0 pb-6 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
            <GraduationCap
              className="h-4.5 w-4.5 text-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit level" : "New level"}
            </DialogTitle>
            <span className="truncate text-xs text-muted-foreground">
              {isEditing ? level.name : "Define a new skill level"}
            </span>
          </div>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <Field label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Foundation"
              className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>

          <Field
            label="Sort order"
            hint="Determines display order — lower numbers come first"
          >
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="e.g. 1"
              className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>

          <Field label="Default age range (optional)">
            <div className="flex items-center gap-2 bg-card">
              <Input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                placeholder="Min"
                className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                placeholder="Max"
                className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
              />
            </div>
          </Field>

          <Field label="Goal (optional)">
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What this level is working toward"
              className="min-h-16 resize-none rounded-lg border border-border bg-input p-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>

          <Field label="Focus summary (optional)">
            <Textarea
              value={focusSummary}
              onChange={(e) => setFocusSummary(e.target.value)}
              placeholder="Key areas of focus at this level"
              className="min-h-16 resize-none rounded-lg border border-border bg-input p-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>

          <Field label="Upgrade criteria (optional)">
            <Textarea
              value={upgradeCriteria}
              onChange={(e) => setUpgradeCriteria(e.target.value)}
              placeholder="What's required to move to the next level"
              className="min-h-16 resize-none rounded-lg border border-border bg-input p-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>
        </div>

        <DialogFooter className="mt-8 flex flex-row items-center justify-between gap-3 p-0 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={!name || !sortOrder || isSaving}
            onClick={handleSubmit}
          >
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create level"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
