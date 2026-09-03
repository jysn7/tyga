"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import {
  useCreateCurriculumModule,
  useUpdateCurriculumModule,
} from "@/hooks/admin/curriculums/use-curriculum-module-mutations"
import type { CurriculumModule } from "@/hooks/admin/curriculums/use-curriculum-modules"
import type { Level } from "@/hooks/admin/levels/use-levels"

const CATEGORY_OPTIONS: {
  label: string
  value: NonNullable<CurriculumModule["category"]>
}[] = [
  { label: "Technical", value: "technical" },
  { label: "Physical", value: "physical" },
  { label: "Mental & character", value: "mental_character" },
  { label: "Format", value: "format" },
]

export function ModulePanel({
  module,
  levels,
  defaultLevelId,
  open,
  onOpenChange,
}: {
  module: CurriculumModule | null // null = creating
  levels: Level[]
  defaultLevelId?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [levelId, setLevelId] = useState<string>(
    () => module?.levelId?.toString() ?? defaultLevelId?.toString() ?? ""
  )
  const [name, setName] = useState(() => module?.name ?? "")
  const [category, setCategory] = useState<string>(() => module?.category ?? "")
  const [description, setDescription] = useState(
    () => module?.description ?? ""
  )
  const [isMilestone, setIsMilestone] = useState(
    () => module?.isMilestone ?? false
  )

  const createModule = useCreateCurriculumModule()
  const updateModule = useUpdateCurriculumModule()
  const isSaving = createModule.isPending || updateModule.isPending
  const isEditing = module !== null

  async function handleSubmit() {
    try {
      if (isEditing) {
        await updateModule.mutateAsync({
          id: module.id,
          name,
          category: category
            ? (category as CurriculumModule["category"])
            : undefined,
          description: description || undefined,
          isMilestone,
        })
        toast.add({ title: "Module updated", type: "success", timeout: 4000 })
      } else {
        await createModule.mutateAsync({
          levelId: Number(levelId),
          name,
          category: category
            ? (category as CurriculumModule["category"])
            : undefined,
          description: description || undefined,
          isMilestone,
        })
        toast.add({ title: "Module created", type: "success", timeout: 4000 })
      }
      onOpenChange(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: isEditing
          ? "Failed to update module"
          : "Failed to create module",
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
            <BookOpen
              className="h-4.5 w-4.5 text-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit module" : "New module"}
            </DialogTitle>
            <span className="truncate text-xs text-muted-foreground">
              {isEditing ? module.name : "Add a curriculum module to a level"}
            </span>
          </div>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          {!isEditing && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-normal text-muted-foreground">
                Level
              </label>
              <Select
                value={levelId}
                onValueChange={(value) => setLevelId(value ?? "")}
              >
                <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.id} value={l.id.toString()}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grip and stance fundamentals"
              className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Category (optional)
            </label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value ?? "")}
            >
              <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this module covers"
              className="min-h-24 resize-none rounded-lg border border-border bg-input p-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="relative flex items-center justify-between overflow-hidden rounded-lg border border-border bg-primary/70 p-3.5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-6 -bottom-6 h-12 w-12 rotate-45 rounded-lg bg-primary"
            />
            <div className="relative flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-white">
                Milestone module
              </span>
              <span className="text-foreground-primary text-xs">
                Flagged as a key checkpoint for progression
              </span>
            </div>
            <Switch
              checked={isMilestone}
              onCheckedChange={setIsMilestone}
              className="relative"
            />
          </div>
        </div>

        <DialogFooter className="mt-8 flex flex-row items-center justify-between gap-3 p-0 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={!name || !levelId || isSaving}
            onClick={handleSubmit}
          >
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create module"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
