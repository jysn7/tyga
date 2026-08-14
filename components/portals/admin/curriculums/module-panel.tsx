"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
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
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit module" : "New module"}
      header={
        <div className="flex items-center gap-4 px-8 pt-8 pb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit module" : "New module"}
            </span>
            <span className="text-sm text-muted-foreground">
              {isEditing ? module.name : "Add a curriculum module to a level"}
            </span>
          </div>
        </div>
      }
      footer={
        <Button
          className="w-full rounded-lg text-sm"
          disabled={!name || !levelId || isSaving}
          onClick={handleSubmit}
        >
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Create module"}
        </Button>
      }
    >
      <div className="flex flex-col">
        {!isEditing && (
          <Field label="Level">
            <Select
              value={levelId}
              onValueChange={(value) => setLevelId(value ?? "")}
            >
              <SelectTrigger className="h-9 w-full border-none bg-transparent px-0 text-sm shadow-none">
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
          </Field>
        )}

        <Field label="Name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grip and stance fundamentals"
            className={fieldStyles}
          />
        </Field>

        <Field label="Category (optional)">
          <Select
            value={category}
            onValueChange={(value) => setCategory(value ?? "")}
          >
            <SelectTrigger className="h-9 w-full border-none bg-transparent px-0 text-sm shadow-none">
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
        </Field>

        <Field label="Description (optional)">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this module covers"
            className={`${fieldStyles} min-h-20 resize-none`}
          />
        </Field>

        <div className="flex items-center justify-between py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-foreground">Milestone module</span>
            <span className="text-xs text-muted-foreground">
              Flagged as a key checkpoint for progression
            </span>
          </div>
          <Switch checked={isMilestone} onCheckedChange={setIsMilestone} />
        </div>
      </div>
    </SidePanel>
  )
}
