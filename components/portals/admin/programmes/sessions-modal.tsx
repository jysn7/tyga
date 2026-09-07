"use client"

import { useState } from "react"
import {
  Trash2,
  Pencil,
  X,
  Check,
  CalendarDays,
  UserPlus,
  UserMinus,
  ChevronDown,
} from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/portals/shared/loader"
import { toast } from "@/components/ui/toast"
import {
  useGenerateSessions,
  useUpdateSession,
  useDeleteSession,
  useAddCoachToSession,
  useRemoveCoachFromSession,
} from "@/hooks/admin/programmes/use-session-mutations"
import {
  useGetSessions,
  useGetSessionCoaches,
} from "@/hooks/admin/programmes/use-programmes"
import type { Session } from "@/hooks/admin/programmes/use-programmes"
import type { Coach } from "@/hooks/admin/use-coaches"

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
]

const STATUS_OPTIONS = ["scheduled", "cancelled", "completed"]
const ROLE_OPTIONS = ["lead", "assistant", "volunteer"]

const TABS = [
  { id: "sessions", label: "Sessions" },
  { id: "generate", label: "Generate" },
] as const

type TabId = (typeof TABS)[number]["id"]

function SessionCoachesPanel({
  sessionId,
  coaches,
}: {
  sessionId: number
  coaches: Coach[]
}) {
  const { data: assignedCoaches, refetch } = useGetSessionCoaches(sessionId)
  const addCoach = useAddCoachToSession()
  const removeCoach = useRemoveCoachFromSession()
  const [selectedCoachId, setSelectedCoachId] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("assistant")

  const assignedIds = new Set((assignedCoaches ?? []).map((c) => c.coachId))
  const availableCoaches = coaches.filter((c) => !assignedIds.has(c.id))

  async function handleAdd() {
    if (!selectedCoachId) return
    try {
      await addCoach.mutateAsync({
        sessionId,
        coachId: Number(selectedCoachId),
        role: selectedRole,
      })
      setSelectedCoachId("")
      refetch()
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

  async function handleRemove(coachId: number) {
    try {
      await removeCoach.mutateAsync({ sessionId, coachId })
      refetch()
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

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background p-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Assigned coaches
      </p>

      {assignedCoaches === undefined ? (
        <Loader />
      ) : assignedCoaches.length === 0 ? (
        <p className="text-xs text-muted-foreground">No coaches assigned yet</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {assignedCoaches.map((c) => (
            <div
              key={c.coachId}
              className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-xs"
            >
              <span className="font-medium text-foreground">{c.fullName}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{c.roleInSession}</span>
                <button
                  onClick={() => handleRemove(c.coachId)}
                  disabled={removeCoach.isPending}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Remove"
                >
                  <UserMinus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-border/60 pt-3">
        <select
          value={selectedCoachId}
          onChange={(e) => setSelectedCoachId(e.target.value)}
          className="h-8 flex-1 rounded-md border border-border bg-input px-2 text-xs"
        >
          <option value="">Select a coach…</option>
          {availableCoaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName}
            </option>
          ))}
        </select>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="h-8 rounded-md border border-border bg-input px-2 text-xs"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!selectedCoachId || addCoach.isPending}
          className="flex h-8 items-center gap-1 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground disabled:opacity-40"
        >
          <UserPlus className="h-3 w-3" />
          Add
        </button>
      </div>
    </div>
  )
}

export function SessionsModal({
  programmeId,
  programmeName,
  coaches = [],
  open,
  onOpenChange,
}: {
  programmeId: number | null
  programmeName?: string
  coaches?: Coach[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: sessions, refetch } = useGetSessions(programmeId ?? undefined)

  const [activeTab, setActiveTab] = useState<TabId>("sessions")

  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [sessionStartTime, setSessionStartTime] = useState("")
  const [sessionEndTime, setSessionEndTime] = useState("")
  const [sessionRangeStart, setSessionRangeStart] = useState("")
  const [sessionRangeEnd, setSessionRangeEnd] = useState("")

  const [editingSessionId, setEditingSessionId] = useState<number | null>(null)
  const [editDate, setEditDate] = useState("")
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")
  const [editStatus, setEditStatus] = useState("")

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [expandedCoachesId, setExpandedCoachesId] = useState<number | null>(
    null
  )

  const generateSessions = useGenerateSessions()
  const updateSession = useUpdateSession()
  const deleteSession = useDeleteSession()

  function resetGenerateForm() {
    setSelectedDays([])
    setSessionStartTime("")
    setSessionEndTime("")
    setSessionRangeStart("")
    setSessionRangeEnd("")
  }

  async function handleGenerateSessions() {
    if (!programmeId) return
    if (selectedDays.length === 0) {
      toast.add({
        title: "Select at least one day",
        type: "error",
        timeout: 4000,
      })
      return
    }
    if (
      sessionStartTime &&
      sessionEndTime &&
      sessionEndTime <= sessionStartTime
    ) {
      toast.add({
        title: "End time must be after start time",
        type: "error",
        timeout: 4000,
      })
      return
    }
    if (
      sessionRangeStart &&
      sessionRangeEnd &&
      sessionRangeEnd < sessionRangeStart
    ) {
      toast.add({
        title: "End date must be after start date",
        type: "error",
        timeout: 4000,
      })
      return
    }
    try {
      const count = await generateSessions.mutateAsync({
        programmeId,
        daysOfWeek: selectedDays,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        rangeStart: sessionRangeStart,
        rangeEnd: sessionRangeEnd,
      })
      toast.add({
        title: `${count} sessions generated`,
        type: "success",
        timeout: 4000,
      })
      resetGenerateForm()
      refetch()
      setActiveTab("sessions")
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to generate sessions",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  function startEdit(s: Session) {
    setEditingSessionId(s.id)
    setEditDate(s.sessionDate ?? "")
    setEditStart(s.startTime?.slice(0, 5) ?? "")
    setEditEnd(s.endTime?.slice(0, 5) ?? "")
    setEditStatus(s.status ?? "scheduled")
  }

  function cancelEdit() {
    setEditingSessionId(null)
  }

  async function handleSaveEdit(sessionId: number) {
    if (editStart && editEnd && editEnd <= editStart) {
      toast.add({
        title: "End time must be after start time",
        type: "error",
        timeout: 4000,
      })
      return
    }
    try {
      await updateSession.mutateAsync({
        sessionId,
        sessionDate: editDate || undefined,
        startTime: editStart || undefined,
        endTime: editEnd || undefined,
        status: editStatus || undefined,
      })
      toast.add({ title: "Session updated", type: "success", timeout: 4000 })
      setEditingSessionId(null)
      refetch()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to update session",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleConfirmDelete(sessionId: number) {
    try {
      await deleteSession.mutateAsync(sessionId)
      toast.add({ title: "Session deleted", type: "success", timeout: 4000 })
      refetch()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to delete session",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setConfirmDeleteId(null)
    }
  }

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Sessions"
      description={
        programmeName
          ? `Manage sessions for ${programmeName}`
          : "Manage programme sessions"
      }
      header={
        <div className="flex items-center gap-3.5 border-b border-border/60 px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
            <CalendarDays
              className="h-4.5 w-4.5 text-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">
              Sessions
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {programmeName
                ? `Manage sessions for ${programmeName}`
                : "Manage programme sessions"}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex gap-1 border-b border-border/60 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative cursor-pointer px-3 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id === "sessions" && sessions?.length ? (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {sessions.length}
                </span>
              ) : null}
              {activeTab === tab.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "generate" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Days of the week
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        setSelectedDays((prev) =>
                          prev.includes(day.value)
                            ? prev.filter((d) => d !== day.value)
                            : [...prev, day.value]
                        )
                      }
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedDays.includes(day.value)
                          ? "bg-primary text-primary-foreground"
                          : "/40 bg-accent text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Start time
                  </span>
                  <Input
                    type="time"
                    value={sessionStartTime}
                    onChange={(e) => setSessionStartTime(e.target.value)}
                    className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    End time
                  </span>
                  <Input
                    type="time"
                    value={sessionEndTime}
                    onChange={(e) => setSessionEndTime(e.target.value)}
                    className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Range start
                  </span>
                  <Input
                    type="date"
                    value={sessionRangeStart}
                    onChange={(e) => setSessionRangeStart(e.target.value)}
                    className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Range end
                  </span>
                  <Input
                    type="date"
                    value={sessionRangeEnd}
                    onChange={(e) => setSessionRangeEnd(e.target.value)}
                    className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerateSessions}
                disabled={
                  selectedDays.length === 0 ||
                  !sessionStartTime ||
                  !sessionEndTime ||
                  !sessionRangeStart ||
                  !sessionRangeEnd ||
                  generateSessions.isPending
                }
                variant="secondary"
                size="lg"
              >
                {generateSessions.isPending
                  ? "Generating..."
                  : "Generate sessions"}
              </Button>
            </div>
          )}

          {activeTab === "sessions" && (
            <>
              {sessions === undefined ? (
                <Loader />
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sessions yet — switch to the Generate tab to create some.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {sessions.map((s) => {
                    const isEditing = editingSessionId === s.id
                    const isConfirmingDelete = confirmDeleteId === s.id
                    const isCoachesExpanded = expandedCoachesId === s.id
                    return (
                      <div
                        key={s.id}
                        className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4"
                      >
                        {isEditing ? (
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-muted-foreground">
                                  Date
                                </span>
                                <Input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="h-9 rounded-md border border-border bg-input px-2.5 text-xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-muted-foreground">
                                  Start
                                </span>
                                <Input
                                  type="time"
                                  value={editStart}
                                  onChange={(e) => setEditStart(e.target.value)}
                                  className="h-9 rounded-md border border-border bg-input px-2.5 text-xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-muted-foreground">
                                  End
                                </span>
                                <Input
                                  type="time"
                                  value={editEnd}
                                  onChange={(e) => setEditEnd(e.target.value)}
                                  className="h-9 rounded-md border border-border bg-input px-2.5 text-xs"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-muted-foreground">
                                  Status
                                </span>
                                <select
                                  value={editStatus}
                                  onChange={(e) =>
                                    setEditStatus(e.target.value)
                                  }
                                  className="h-9 rounded-md border border-border bg-input px-2 text-xs"
                                >
                                  {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={cancelEdit}
                                className="flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-muted"
                              >
                                <X className="h-3.5 w-3.5" />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(s.id)}
                                disabled={updateSession.isPending}
                                className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-40"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Save
                              </button>
                            </div>
                          </div>
                        ) : isConfirmingDelete ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-destructive">
                              Delete this session? This can&apos;t be undone.
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleConfirmDelete(s.id)}
                                disabled={deleteSession.isPending}
                                className="text-destructive-foreground rounded-md bg-destructive px-2.5 py-1 text-xs font-medium hover:bg-destructive/90"
                              >
                                {deleteSession.isPending
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-foreground">
                                {s.sessionDate
                                  ? new Date(
                                      `${s.sessionDate}T00:00:00`
                                    ).toLocaleDateString()
                                  : "No date"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {s.startTime?.slice(0, 5)} -{" "}
                                {s.endTime?.slice(0, 5)} ·{" "}
                                {s.venueName ?? "No venue"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-muted-foreground">
                                {s.coachCount ?? 0} coaches ·{" "}
                                {s.enrolledCount ?? 0} enrolled
                                {s.status === "completed"
                                  ? ` · ${s.attendanceCount ?? 0} attended`
                                  : ""}
                              </span>
                              <span
                                className={`rounded px-2 py-1 text-xs font-medium ${
                                  s.status === "scheduled"
                                    ? "bg-information text-white"
                                    : s.status === "cancelled"
                                      ? "bg-destructive text-white"
                                      : "bg-green-600 text-white"
                                }`}
                              >
                                {s.status}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setExpandedCoachesId(
                                      isCoachesExpanded ? null : s.id
                                    )
                                  }
                                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                                    isCoachesExpanded
                                      ? "bg-accent text-foreground"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }`}
                                  title="Coaches"
                                >
                                  <ChevronDown
                                    className={`h-3.5 w-3.5 transition-transform ${
                                      isCoachesExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                                <button
                                  onClick={() => startEdit(s)}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                                  title="Edit session"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(s.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  title="Delete session"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {isCoachesExpanded && !isEditing && (
                          <SessionCoachesPanel
                            sessionId={s.id}
                            coaches={coaches}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SidePanel>
  )
}
