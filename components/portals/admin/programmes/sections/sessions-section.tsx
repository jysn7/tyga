"use client"

import { useState } from "react"
import { Trash2, Pencil, X, Check } from "lucide-react"
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
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-foreground">
        Session Management
      </h3>

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Generate sessions
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => (
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
                  selectedDays.includes(day.value)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Start time</span>
              <Input
                type="time"
                value={sessionStartTime}
                onChange={(e) => setSessionStartTime(e.target.value)}
                className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">End time</span>
              <Input
                type="time"
                value={sessionEndTime}
                onChange={(e) => setSessionEndTime(e.target.value)}
                className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Start date</span>
              <Input
                type="date"
                value={sessionRangeStart}
                onChange={(e) => setSessionRangeStart(e.target.value)}
                className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">End date</span>
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
            className="h-11 text-sm"
          >
            {generateSessions.isPending ? "Generating..." : "Generate sessions"}
          </Button>
        </div>
      </div>

      <div className="border-t border-border/60 pt-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Existing sessions ({sessions?.length || 0})
        </p>
        {sessions === undefined ? (
          <Loader />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sessions generated yet
          </p>
        ) : (
          <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {sessions.map((s) => {
              const isEditing = editingSessionId === s.id
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                >
                  {isEditing ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="h-8 w-36 rounded-md border border-border bg-input px-2 text-xs"
                      />
                      <Input
                        type="time"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        className="h-8 w-24 rounded-md border border-border bg-input px-2 text-xs"
                      />
                      <Input
                        type="time"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        className="h-8 w-24 rounded-md border border-border bg-input px-2 text-xs"
                      />
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="h-8 rounded-md border border-border bg-input px-2 text-xs"
                      >
                        <option value="scheduled">scheduled</option>
                        <option value="cancelled">cancelled</option>
                        <option value="completed">completed</option>
                      </select>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => handleSaveEdit(s.id)}
                          disabled={updateSession.isPending}
                          className="rounded-md p-1.5 text-green-600 hover:bg-green-600/10"
                          title="Save"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span>
                          {new Date(
                            `${s.sessionDate}T00:00:00`
                          ).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)}{" "}
                          · {s.venueName ?? "No venue"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {s.coachCount ?? 0} coaches · {s.enrolledCount ?? 0}{" "}
                          enrolled
                          {s.status === "completed"
                            ? ` · ${s.attendanceCount ?? 0} attended`
                            : ""}
                        </span>
                        <span
                          className={`text-xs ${s.status === "scheduled" ? "text-green-600" : s.status === "cancelled" ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {s.status}
                        </span>
                        <button
                          onClick={() => startEdit(s)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Edit session"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingSessionId === s.id}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete session"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
