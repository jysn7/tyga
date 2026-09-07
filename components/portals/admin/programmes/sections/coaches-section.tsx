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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader } from "@/components/portals/shared/loader"
import { toast } from "@/components/ui/toast"
import {
  useAssignCoachToProgramme,
  useRemoveCoachFromProgramme,
} from "@/hooks/admin/programmes/use-programme-coaches"
import type { Coach } from "@/hooks/admin/use-coaches"
import type { ProgrammeCoach } from "@/hooks/admin/programmes/use-programmes"

const ROLE_OPTIONS = [
  { label: "Lead", value: "lead" },
  { label: "Assistant", value: "assistant" },
  { label: "Volunteer", value: "volunteer" },
]

function getInitials(name: string | undefined | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }
  if (email) return email[0]?.toUpperCase() ?? "?"
  return "?"
}

export function CoachesSection({
  programmeId,
  coaches,
  assignedCoaches,
  onCoachesChange,
}: {
  programmeId: number
  coaches: Coach[]
  assignedCoaches: ProgrammeCoach[] | undefined
  onCoachesChange: () => void
}) {
  const [selectedCoachId, setSelectedCoachId] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("assistant")

  const assignCoach = useAssignCoachToProgramme()
  const removeCoach = useRemoveCoachFromProgramme()

  // Show loading state
  if (assignedCoaches === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <h3 className="text-sm font-medium text-foreground">
          Coach management
        </h3>
        <div className="flex h-32 items-center justify-center">
          <Loader />
        </div>
      </div>
    )
  }

  async function handleAssignCoach() {
    if (!selectedCoachId) return
    try {
      await assignCoach.mutateAsync({
        programmeId,
        coachId: Number(selectedCoachId),
        role: selectedRole,
      })
      toast.add({ title: "Coach assigned", type: "success", timeout: 4000 })
      setSelectedCoachId("")
      setSelectedRole("assistant")
      onCoachesChange()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to assign coach",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleRemoveCoach(coachId: number) {
    try {
      await removeCoach.mutateAsync({ programmeId, coachId })
      toast.add({ title: "Coach removed", type: "success", timeout: 4000 })
      onCoachesChange()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to remove coach",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  const availableCoaches = coaches.filter(
    (c) => !assignedCoaches?.some((ac) => ac.coachId === c.id)
  )

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-medium text-foreground">Coach management</h3>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Assigned coaches ({assignedCoaches.length})
        </p>
        {assignedCoaches.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/60 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No coaches assigned yet
            </p>
            <p className="text-xs text-muted-foreground/60">
              Assign a coach using the form below
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {assignedCoaches.map((c) => (
              <div
                key={c.coachId}
                className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-accent/40"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-pink text-xs font-medium text-primary-foreground">
                      {getInitials(c.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {c.fullName || c.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {c.roleInProgramme}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCoach(c.coachId)}
                  className="text-xs text-muted-foreground opacity-0 transition-colors duration-200 group-hover:opacity-100 hover:text-destructive"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-border/60 pt-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Assign a coach
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={selectedCoachId}
            onValueChange={(value) => setSelectedCoachId(value ?? "")}
          >
            <SelectTrigger className="h-11 flex-1 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0">
              <SelectValue placeholder="Select a coach..." />
            </SelectTrigger>
            <SelectContent>
              {availableCoaches.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No coaches available
                </div>
              ) : (
                availableCoaches.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{c.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        ({c.email})
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value ?? "")}
          >
            <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0 sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleAssignCoach}
            disabled={!selectedCoachId || assignCoach.isPending}
            className="h-11 shrink-0 px-6 text-sm"
          >
            {assignCoach.isPending ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </div>
    </div>
  )
}
