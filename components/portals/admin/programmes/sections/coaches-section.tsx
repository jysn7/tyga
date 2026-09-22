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
import { Users, UserMinus } from "lucide-react"

const ROLE_OPTIONS = [
  { label: "Lead", value: "lead" },
  { label: "Assistant", value: "assistant" },
  { label: "Volunteer", value: "volunteer" },
]

const ROLE_STYLES: Record<string, string> = {
  lead: "bg-pink text-background",
  assistant: "bg-input text-muted-foreground",
  volunteer: "bg-input text-muted-foreground",
}

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

  if (assignedCoaches === undefined) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-input">
            <Users
              className="h-3.5 w-3.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Coach management
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Assign coaches and set their roles for this programme.
            </p>
          </div>
        </div>
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
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-input">
          <Users
            className="h-3.5 w-3.5 text-muted-foreground"
            strokeWidth={1.75}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Coach management
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Assign coaches and set their roles for this programme.
          </p>
        </div>
      </div>

      {/* Assigned coaches */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Assigned coaches
          </span>
          <span className="rounded-md bg-input px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {assignedCoaches.length}
          </span>
        </div>

        {assignedCoaches.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-6 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-input">
              <Users
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">
                No coaches assigned
              </span>
              <span className="text-xs text-muted-foreground">
                Use the form below to assign a coach.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {assignedCoaches.map((c) => (
              <div
                key={c.coachId}
                className="group flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:bg-accent/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-input text-[11px] font-medium text-muted-foreground">
                      {getInitials(c.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {c.fullName || c.email}
                    </span>
                    <span
                      className={`w-fit rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                        ROLE_STYLES[c.roleInProgramme] ??
                        "bg-input text-muted-foreground"
                      }`}
                    >
                      {c.roleInProgramme}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCoach(c.coachId)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remove coach"
                >
                  <UserMinus className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign form */}
      <div className="flex flex-col gap-3 border-t border-border/60 pt-5">
        <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Assign a coach
        </span>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Coach
            </span>
            <Select
              value={selectedCoachId}
              onValueChange={(value) => setSelectedCoachId(value ?? "")}
            >
              <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0">
                <SelectValue placeholder="Select a coach…" />
              </SelectTrigger>
              <SelectContent>
                {availableCoaches.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No coaches available
                  </div>
                ) : (
                  availableCoaches.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{c.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 sm:w-40">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Role
            </span>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value ?? "")}
            >
              <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0">
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
          </div>

          <div className="flex flex-col gap-2 sm:w-auto">
            {/* Spacer to align button with inputs on desktop */}
            <span className="hidden text-[11px] font-medium tracking-wider text-transparent uppercase sm:block">
              &nbsp;
            </span>
            <Button
              onClick={handleAssignCoach}
              disabled={!selectedCoachId || assignCoach.isPending}
              className="h-11 w-full shrink-0 px-6 text-sm sm:w-auto"
            >
              {assignCoach.isPending ? "Assigning…" : "Assign"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
