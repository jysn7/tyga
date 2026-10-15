"use client"

import { useMemo, useState } from "react"
import { useParams, useSearchParams, notFound } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  MinusCircle,
  Save,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  useCoachSessionDetail,
  useCoachSessionRoster,
  useCoachSessionCurriculum,
} from "@/hooks/coach/use-coach-session-detail"
import {
  useMarkAttendance,
  useBulkMarkAttendance,
  useSaveSessionNotes,
  useTagSessionCurriculum,
} from "@/hooks/coach/use-coach-mutations"

const STATUS_OPTIONS = [
  {
    value: "present",
    label: "Present",
    icon: CheckCircle2,
    color: "text-green",
    bg: "bg-green-light",
  },
  {
    value: "late",
    label: "Late",
    icon: Clock3,
    color: "text-orange",
    bg: "bg-orange-light",
  },
  {
    value: "excused",
    label: "Excused",
    icon: MinusCircle,
    color: "text-muted-foreground",
    bg: "bg-input",
  },
  {
    value: "absent",
    label: "Absent",
    icon: XCircle,
    color: "text-rose",
    bg: "bg-rose/50",
  },
] as const

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

export default function CoachSessionDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const sessionId = Number(params.id)

  const {
    data: detail,
    isLoading: detailLoading,
    error: detailError,
  } = useCoachSessionDetail(sessionId)

  if (detailLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    )
  }
  if (detailError || !detail) notFound()

  const hasStarted =
    new Date(`${detail.session_date}T${detail.start_time}`) <= new Date()
  const isCancelled = detail.status === "cancelled"

  const initialTab =
    searchParams.get("focus") === "attendance" ? "roster" : "roster"

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Link
        href="/coach/sessions"
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        sessions / {detail.programme_name}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
          <CalendarDays
            className="h-4.5 w-4.5 text-foreground"
            strokeWidth={1.75}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
            {detail.programme_name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" strokeWidth={1.75} />
              {detail.start_time.slice(0, 5)} – {detail.end_time.slice(0, 5)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" strokeWidth={1.75} />
              {detail.venue_name}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" strokeWidth={1.75} />
              {detail.enrolled_count} enrolled
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={initialTab} className="flex flex-col gap-5">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit">
          <TabsTrigger value="roster" className={TAB_TRIGGER_CLASS}>
            Roster & attendance
          </TabsTrigger>
          <TabsTrigger value="curriculum" className={TAB_TRIGGER_CLASS}>
            Notes & curriculum
          </TabsTrigger>
          <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
            Overview
          </TabsTrigger>
        </TabsList>

        {/* ROSTER */}
        <TabsContent
          value="roster"
          className="mt-0 data-[state=inactive]:hidden"
        >
          <RosterTab
            sessionId={sessionId}
            hasStarted={hasStarted}
            isCancelled={isCancelled}
          />
        </TabsContent>

        {/* CURRICULUM */}
        <TabsContent
          value="curriculum"
          className="mt-0 data-[state=inactive]:hidden"
        >
          <CurriculumTab
            sessionId={sessionId}
            initialNotes={detail.coach_notes ?? ""}
            hasStarted={hasStarted}
            isCancelled={isCancelled}
          />
        </TabsContent>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-0">
          <section className="flex flex-col rounded-xl bg-card p-5 shadow">
            <h2 className="pb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Session details
            </h2>
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-xs text-muted-foreground">Programme</span>
                <span className="text-sm text-foreground">
                  {detail.programme_name}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-xs text-muted-foreground">Time</span>
                <span className="text-sm text-foreground">
                  {detail.start_time.slice(0, 5)} –{" "}
                  {detail.end_time.slice(0, 5)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-xs text-muted-foreground">Venue</span>
                <span className="text-sm text-foreground">
                  {detail.venue_name}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-xs text-muted-foreground">Enrolled</span>
                <span className="text-sm text-foreground">
                  {detail.enrolled_count}
                </span>
              </div>
              {detail.max_ratio && (
                <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
                  <span className="text-xs text-muted-foreground">
                    Max ratio
                  </span>
                  <span className="text-sm text-foreground">
                    1:{detail.max_ratio}
                  </span>
                </div>
              )}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---------- Lock banner ----------

function LockBanner({
  hasStarted,
  isCancelled,
}: {
  hasStarted: boolean
  isCancelled: boolean
}) {
  if (hasStarted && !isCancelled) return null

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
      <AlertCircle
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
      />
      <p className="text-xs text-muted-foreground">
        {isCancelled
          ? "This session was cancelled. Nothing to record."
          : "This session hasn't started yet. Attendance, curriculum, and notes unlock when it begins."}
      </p>
    </div>
  )
}

// ---------- Roster ----------

function RosterTab({
  sessionId,
  hasStarted,
  isCancelled,
}: {
  sessionId: number
  hasStarted: boolean
  isCancelled: boolean
}) {
  const { data: roster, isLoading } = useCoachSessionRoster(sessionId)
  const mark = useMarkAttendance()
  const bulk = useBulkMarkAttendance()
  const [confirmBulk, setConfirmBulk] = useState(false)

  const readOnly = !hasStarted || isCancelled

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }

  if (!roster || roster.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
          <Users
            className="h-4.5 w-4.5 text-muted-foreground"
            strokeWidth={1.75}
          />
        </div>
        <span className="text-sm font-semibold text-foreground">
          No enrolled members
        </span>
      </div>
    )
  }

  function handleMark(
    memberId: number,
    status: (typeof STATUS_OPTIONS)[number]["value"]
  ) {
    mark.mutate(
      { sessionId, memberId, status },
      {
        onError: (err) =>
          toast.add({
            title: "Failed to mark attendance",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  function handleBulkMark() {
    bulk.mutate(
      { sessionId, status: "present" },
      {
        onSuccess: () => {
          toast.add({
            title: "All members marked present",
            type: "success",
            timeout: 3000,
          })
          setConfirmBulk(false)
        },
        onError: (err) => {
          toast.add({
            title: "Failed to mark attendance",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          })
          setConfirmBulk(false)
        },
      }
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <LockBanner hasStarted={hasStarted} isCancelled={isCancelled} />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Roster ({roster.length})
        </h2>

        {!readOnly &&
          (confirmBulk ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Overwrite all with present?
              </span>
              <Button
                size="sm"
                disabled={bulk.isPending}
                onClick={handleBulkMark}
                className="h-8 text-xs"
              >
                {bulk.isPending ? "Marking…" : "Yes"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmBulk(false)}
                className="h-8 text-xs"
              >
                No
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmBulk(true)}
              className="h-8 text-xs"
            >
              Mark all present
            </Button>
          ))}
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow">
        <div className="flex flex-col divide-y divide-border/60">
          {roster.map((m) => (
            <div
              key={m.member_id}
              className="flex items-center justify-between gap-3 px-5 py-3.5"
            >
              <span className="truncate text-sm font-medium text-foreground">
                {m.full_name}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                {STATUS_OPTIONS.map((opt) => {
                  const isActive = m.attendance_status === opt.value
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={readOnly || mark.isPending}
                      onClick={() => handleMark(m.member_id, opt.value)}
                      title={opt.label}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                        isActive
                          ? `${opt.bg} ${opt.color}`
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------- Curriculum ----------

function CurriculumTab({
  sessionId,
  initialNotes,
  hasStarted,
  isCancelled,
}: {
  sessionId: number
  initialNotes: string
  hasStarted: boolean
  isCancelled: boolean
}) {
  const { data: modules, isLoading } = useCoachSessionCurriculum(sessionId)
  const tagCurriculum = useTagSessionCurriculum()
  const saveNotes = useSaveSessionNotes()

  const [notes, setNotes] = useState(initialNotes)
  const [selectionOverrides, setSelectionOverrides] = useState<
    Record<number, boolean>
  >({})

  const readOnly = !hasStarted || isCancelled
  const taggedModuleIds = useMemo(
    () =>
      new Set(
        modules?.filter((m) => m.is_tagged).map((m) => m.module_id) ?? []
      ),
    [modules]
  )

  const selected = useMemo(() => {
    const next = new Set(taggedModuleIds)

    Object.entries(selectionOverrides).forEach(([moduleId, value]) => {
      const id = Number(moduleId)
      if (value) next.add(id)
      else next.delete(id)
    })

    return next
  }, [selectionOverrides, taggedModuleIds])

  function toggle(moduleId: number) {
    const baseValue = taggedModuleIds.has(moduleId)
    const currentOverride = selectionOverrides[moduleId]
    const nextValue = currentOverride ?? baseValue
    const desiredValue = !nextValue

    setSelectionOverrides((prev) => {
      const next = { ...prev }

      if (desiredValue === baseValue) {
        delete next[moduleId]
        return next
      }

      next[moduleId] = desiredValue
      return next
    })
  }

  function handleSaveCurriculum() {
    tagCurriculum.mutate(
      { sessionId, moduleIds: Array.from(selected) },
      {
        onSuccess: () =>
          toast.add({
            title: "Curriculum saved",
            type: "success",
            timeout: 3000,
          }),
        onError: (err) =>
          toast.add({
            title: "Failed to save curriculum",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  function handleSaveNotes() {
    saveNotes.mutate(
      { sessionId, notes },
      {
        onSuccess: () =>
          toast.add({
            title: "Notes saved",
            type: "success",
            timeout: 3000,
          }),
        onError: (err) =>
          toast.add({
            title: "Failed to save notes",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <LockBanner hasStarted={hasStarted} isCancelled={isCancelled} />

      {/* Curriculum */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Curriculum covered
          </h2>
          <span className="text-xs text-muted-foreground">
            {isLoading
              ? ""
              : `${selected.size} of ${modules?.length ?? 0} tagged`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center rounded-xl bg-card shadow">
            <Loader />
          </div>
        ) : !modules || modules.length === 0 ? (
          <div className="rounded-xl bg-card p-6 text-center shadow">
            <p className="text-sm text-muted-foreground">
              No curriculum modules for this level.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl bg-card shadow">
              <div className="flex flex-col divide-y divide-border/60">
                {modules.map((mod) => {
                  const isSelected = selected.has(mod.module_id)
                  return (
                    <button
                      key={mod.module_id}
                      type="button"
                      disabled={readOnly}
                      onClick={() => toggle(mod.module_id)}
                      className="flex items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          )}
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-sm text-foreground">
                            {mod.module_name}
                          </span>
                          {mod.category && (
                            <span className="text-xs text-muted-foreground capitalize">
                              {mod.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {!readOnly && (
              <Button
                onClick={handleSaveCurriculum}
                disabled={tagCurriculum.isPending}
                variant="secondary"
                className="w-fit"
              >
                {tagCurriculum.isPending ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    strokeWidth={1.75}
                  />
                ) : (
                  <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
                )}
                Save curriculum
              </Button>
            )}
          </>
        )}
      </section>

      {/* Notes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Session notes
        </h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={readOnly}
          placeholder="What happened in this session?"
          className="min-h-32 resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0 disabled:opacity-50"
        />
        {!readOnly && (
          <Button
            onClick={handleSaveNotes}
            disabled={saveNotes.isPending}
            variant="secondary"
            className="w-fit"
          >
            {saveNotes.isPending ? (
              <Loader2
                className="h-3.5 w-3.5 animate-spin"
                strokeWidth={1.75}
              />
            ) : (
              <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            Save notes
          </Button>
        )}
      </section>
    </div>
  )
}
