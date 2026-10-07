"use client"

import { useState } from "react"
import { CheckCircle2, Clock3, MinusCircle, Users, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Loader } from "@/components/portals/shared/loader"
import { StatusBadge } from "@/components/portals/shared/StatusBadge"
import { SessionLockBanner } from "@/components/portals/shared/coach/session-lock-banner"
import {
  useCoachSessionRoster,
  type CoachRosterMember,
} from "@/hooks/coach/use-sessions"
import {
  useBulkMarkAttendance,
  useMarkAttendance,
} from "@/hooks/coach/use-sessions-mutations"
import { toast } from "@/components/ui/toast"

const ATTENDANCE_OPTIONS = [
  {
    status: "present",
    label: "Present",
    icon: CheckCircle2,
    activeClass: "bg-green-light text-green",
  },
  {
    status: "late",
    label: "Late",
    icon: Clock3,
    activeClass: "bg-orange-light text-orange",
  },
  {
    status: "excused",
    label: "Excused",
    icon: MinusCircle,
    activeClass: "bg-input text-muted-foreground",
  },
  {
    status: "absent",
    label: "Absent",
    icon: XCircle,
    activeClass: "bg-rose/50 text-rose",
  },
] as const

function showMutationError(title: string, error: unknown) {
  toast.add({
    title,
    description:
      error instanceof Error ? error.message : "Something went wrong.",
    type: "error",
    timeout: 5000,
  })
}

export function SessionRosterTab({
  sessionId,
  readOnly,
  isCancelled,
}: {
  sessionId: number
  readOnly: boolean
  isCancelled: boolean
}) {
  const {
    data: roster,
    isLoading,
    error,
    refetch,
  } = useCoachSessionRoster(sessionId)
  const markAttendance = useMarkAttendance()
  const bulkMarkAttendance = useBulkMarkAttendance()
  const [confirmBulk, setConfirmBulk] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <SessionLockBanner readOnly={readOnly} isCancelled={isCancelled} />
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            Could not load this session&apos;s roster: {error.message}
          </span>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!roster?.length) {
    return (
      <div className="flex flex-col gap-3">
        <SessionLockBanner readOnly={readOnly} isCancelled={isCancelled} />
        <EmptyState
          icon={Users}
          title="No enrolled members"
          description="Active programme members will appear here."
        />
      </div>
    )
  }

  function markMember(member: CoachRosterMember, status: string) {
    if (
      status !== "present" &&
      status !== "absent" &&
      status !== "late" &&
      status !== "excused"
    ) {
      return
    }

    markAttendance.mutate(
      { sessionId, memberId: member.member_id, status },
      {
        onError: (mutationError) =>
          showMutationError("Attendance not saved", mutationError),
      }
    )
  }

  function markEveryonePresent() {
    bulkMarkAttendance.mutate(
      { sessionId, status: "present" },
      {
        onSuccess: () => {
          setConfirmBulk(false)
          toast.add({
            title: "Roster marked present",
            type: "success",
            timeout: 3000,
          })
        },
        onError: (mutationError) => {
          setConfirmBulk(false)
          showMutationError("Attendance not saved", mutationError)
        },
      }
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <SessionLockBanner readOnly={readOnly} isCancelled={isCancelled} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Roster ({roster.length})
        </h2>

        {!readOnly &&
          (confirmBulk ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Mark everyone present?
              </span>
              <Button
                size="sm"
                disabled={bulkMarkAttendance.isPending}
                onClick={markEveryonePresent}
              >
                {bulkMarkAttendance.isPending ? "Marking…" : "Confirm"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={bulkMarkAttendance.isPending}
                onClick={() => setConfirmBulk(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={bulkMarkAttendance.isPending}
              onClick={() => setConfirmBulk(true)}
            >
              Mark all present
            </Button>
          ))}
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow">
        <ul className="divide-y divide-border/60">
          {roster.map((member) => (
            <li
              key={member.member_id}
              className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-medium text-foreground">
                  {member.full_name}
                </span>
                <StatusBadge status={member.attendance_status ?? "unmarked"} />
              </div>
              <div
                className="flex shrink-0 items-center gap-1"
                aria-label={`Attendance for ${member.full_name}`}
              >
                {ATTENDANCE_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const selected = member.attendance_status === option.status
                  return (
                    <button
                      key={option.status}
                      type="button"
                      aria-label={`${option.label}: ${member.full_name}`}
                      aria-pressed={selected}
                      title={option.label}
                      disabled={
                        readOnly ||
                        markAttendance.isPending ||
                        bulkMarkAttendance.isPending
                      }
                      onClick={() => markMember(member, option.status)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                        selected
                          ? option.activeClass
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
