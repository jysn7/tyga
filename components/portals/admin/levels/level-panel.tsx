"use client"

import { useState } from "react"
import { GraduationCap } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  useCreateLevel,
  useUpdateLevel,
} from "@/hooks/admin/levels/use-level-mutations"
import type { Level } from "@/hooks/admin/levels/use-levels"

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border/60 py-3 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}

const fieldStyles =
  "h-auto border-none bg-transparent px-0 shadow-none text-[15px] text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50"

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
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit level" : "New level"}
      header={
        <div className="flex items-center gap-4 px-8 pt-8 pb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit level" : "New level"}
            </span>
            <span className="text-sm text-muted-foreground">
              {isEditing ? level.name : "Define a new skill level"}
            </span>
          </div>
        </div>
      }
      footer={
        <Button
          className="w-full rounded-lg text-sm"
          disabled={!name || !sortOrder || isSaving}
          onClick={handleSubmit}
        >
          {isSaving ? "Saving..." : isEditing ? "Save changes" : "Create level"}
        </Button>
      }
    >
      <div className="flex flex-col">
        <Field label="Name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Foundation"
            className={fieldStyles}
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
            className={fieldStyles}
          />
        </Field>

        <Field label="Default age range (optional)">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              placeholder="Min"
              className={fieldStyles}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              placeholder="Max"
              className={fieldStyles}
            />
          </div>
        </Field>

        <Field label="Goal (optional)">
          <Textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What this level is working toward"
            className={`${fieldStyles} min-h-16 resize-none`}
          />
        </Field>

        <Field label="Focus summary (optional)">
          <Textarea
            value={focusSummary}
            onChange={(e) => setFocusSummary(e.target.value)}
            placeholder="Key areas of focus at this level"
            className={`${fieldStyles} min-h-16 resize-none`}
          />
        </Field>

        <Field label="Upgrade criteria (optional)">
          <Textarea
            value={upgradeCriteria}
            onChange={(e) => setUpgradeCriteria(e.target.value)}
            placeholder="What's required to move to the next level"
            className={`${fieldStyles} min-h-16 resize-none`}
          />
        </Field>
      </div>
    </SidePanel>
  )
}
