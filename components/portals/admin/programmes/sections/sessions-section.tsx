"use client"

import { useState } from "react"
import { Trash2, Pencil, X, Check, CalendarDays, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/portals/shared/loader"
import { toast } from "@/components/ui/toast"
import {
  useGenerateSessions,
  useUpdateSession,
  useDeleteSession,
} from "@/hooks/admin/programmes/use-session-mutations"
import type { Session } from "@/hooks/admin/programmes/use-programmes"

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
]

export function SessionsSection({
  programmeId,
  sessions,
  onSessionsChange,
}: {
  programmeId: number
  sessions: Session[] | undefined
  onSessionsChange: () => void
}) {
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
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(
    null
  )

  const generateSessions = useGenerateSessions()
  const updateSession = useUpdateSession()
  const deleteSession = useDeleteSession()

  async function handleGenerateSessions() {
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
      onSessionsChange()
      setSelectedDays([])
      setSessionStartTime("")
      setSessionEndTime("")
      setSessionRangeStart("")
      setSessionRangeEnd("")
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
    setEditStart(s.startTime ?? "")
    setEditEnd(s.endTime ?? "")
    setEditStatus(s.status ?? "")
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
      onSessionsChange()
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

  async function handleDelete(sessionId: number) {
    setDeletingSessionId(sessionId)
    try {
      await deleteSession.mutateAsync(sessionId)
      toast.add({ title: "Session deleted", type: "success", timeout: 4000 })
      onSessionsChange()
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
      setDeletingSessionId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-input">
          <CalendarDays
            className="h-3.5 w-3.5 text-muted-foreground"
            strokeWidth={1.75}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Session management
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Generate recurring sessions and edit individual occurrences.
          </p>
        </div>
      </div>

      {/* Generate form */}
      <div className="flex flex-col gap-3">
        {/* Days */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Days of the week
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => {
              const isSelected = selectedDays.includes(day.value)
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => {
                    setSelectedDays((prev) =>
                      prev.includes(day.value)
                        ? prev.filter((d) => d !== day.value)
                        : [...prev, day.value]
                    )
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-input text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {day.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Start time
            </span>
            <Input
              type="time"
              value={sessionStartTime}
              onChange={(e) => setSessionStartTime(e.target.value)}
              className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
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

        {/* Range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Start date
            </span>
            <Input
              type="date"
              value={sessionRangeStart}
              onChange={(e) => setSessionRangeStart(e.target.value)}
              className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              End date
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
          className="h-11 w-full text-sm"
        >
          {generateSessions.isPending ? "Generating…" : "Generate sessions"}
        </Button>
      </div>

      {/* Existing sessions */}
      <div className="flex flex-col gap-3 border-t border-border/60 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Existing sessions
          </span>
          <span className="rounded-md bg-input px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {sessions?.length ?? 0}
          </span>
        </div>

        {sessions === undefined ? (
          <Loader />
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-6 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-input">
              <CalendarDays
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">
                No sessions yet
              </span>
              <span className="text-xs text-muted-foreground">
                Generate sessions above to get started.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex max-h-96 flex-col gap-1.5 overflow-y-auto pr-1">
            {sessions.map((s) => {
              const isEditing = editingSessionId === s.id
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 px-3.5 py-2.5"
                >
                  {isEditing ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
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
                          <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
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
                          <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
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
                          <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                            Status
                          </span>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="h-9 rounded-md border border-border bg-input px-2 text-xs text-foreground capitalize shadow-none focus-visible:ring-0 focus-visible:outline-none"
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(s.id)}
                          disabled={updateSession.isPending}
                          className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {new Date(
                            `${s.sessionDate}T00:00:00`
                          ).toLocaleDateString("en-ZA", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>
                            {s.startTime?.slice(0, 5)} –{" "}
                            {s.endTime?.slice(0, 5)}
                          </span>
                          <span>·</span>
                          <MapPin
                            className="h-3 w-3 shrink-0"
                            strokeWidth={1.75}
                          />
                          <span className="truncate">
                            {s.venueName ?? "No venue"}
                          </span>
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          {s.coachCount ?? 0} coaches · {s.enrolledCount ?? 0}{" "}
                          enrolled
                          {s.status === "completed"
                            ? ` · ${s.attendanceCount ?? 0} attended`
                            : ""}
                        </span>
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${
                            s.status === "scheduled"
                              ? "bg-primary/10 text-primary"
                              : s.status === "cancelled"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-input text-muted-foreground"
                          }`}
                        >
                          {s.status}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => startEdit(s)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            title="Edit session"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              strokeWidth={1.75}
                            />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={deletingSessionId === s.id}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                            title="Delete session"
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              strokeWidth={1.75}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
