"use client"

import { useState } from "react"
import { UserCog } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Field } from "@/components/portals/shared/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { useUpdateCoach } from "@/hooks/admin/use-update-coach"
import type { Coach, CoachType } from "@/hooks/admin/use-coaches"

const COACH_TYPE_OPTIONS: { label: string; value: CoachType }[] = [
  { label: "Head coach", value: "head_coach" },
  { label: "Assistant", value: "assistant_coach" },
  { label: "Volunteer", value: "volunteer" },
]

export function EditCoachPanel({
  coach,
  open,
  onOpenChange,
}: {
  coach: Coach | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [coachType, setCoachType] = useState<CoachType | "">(
    () => coach?.coachType ?? ""
  )
  const [maxRatio, setMaxRatio] = useState(
    () => coach?.maxStudentRatio?.toString() ?? ""
  )
  const updateCoach = useUpdateCoach()

  if (!coach) return null

  const coachFullName = coach.fullName
  const coachEmail = coach.email
  const coachId = coach.id

  async function handleSubmit() {
    try {
      await updateCoach.mutateAsync({
        coachId: coachId,
        coachType: coachType || undefined,
        maxStudentRatio: maxRatio ? Number(maxRatio) : undefined,
      })
      toast.add({
        title: "Coach updated",
        description: `${coachFullName}'s details were saved.`,
        type: "success",
        timeout: 4000,
      })
      onOpenChange(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to update coach",
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
      title="Edit coach"
      header={
        <div className="flex items-center gap-4 px-8 pt-8 pb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent">
            <UserCog className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {coachFullName}
            </span>
            <span className="text-sm text-muted-foreground">{coachEmail}</span>
          </div>
        </div>
      }
      footer={
        <Button
          className="w-full rounded-lg text-sm"
          disabled={updateCoach.isPending}
          onClick={handleSubmit}
        >
          {updateCoach.isPending ? "Saving..." : "Save changes"}
        </Button>
      }
    >
      <div className="flex flex-col">
        <Field label="Coach type">
          <div className="grid grid-cols-3 gap-1.5 p-0.5">
            {COACH_TYPE_OPTIONS.map((opt) => {
              const isSelected = coachType === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCoachType(isSelected ? "" : opt.value)}
                  className={`rounded-lg px-3 py-2.5 text-center text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-secondary text-primary shadow"
                      : "bg-background text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="Max student ratio">
          <Input
            type="number"
            min={1}
            value={maxRatio}
            onChange={(e) => setMaxRatio(e.target.value)}
            placeholder="e.g. 8"
          />
        </Field>
      </div>
    </SidePanel>
  )
}
