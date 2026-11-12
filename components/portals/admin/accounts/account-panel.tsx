"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { Field } from "@/components/portals/shared/field"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useProgressionBoard,
  useModuleMatrix,
  useProgressNotes,
  useAdvanceMembersBulk,
} from "@/hooks/coach/use-coach-progressions"
import { toast } from "@/components/ui/toast"

const fmt = (s: string | null | undefined) =>
  s ? format(parseISO(s), "d MMM yyyy") : "—"

const initials = (n: string | null) =>
  (n ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")

const CATEGORY_LABEL: Record<string, string> = {
  technical: "Technical",
  physical: "Physical",
  mental_character: "Mental & character",
  format: "Format & course",
}
const CATEGORY_ORDER = ["technical", "physical", "mental_character", "format"]

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium w-fit text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

function Pill({ label, cls }: { label: string; cls: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium text-foreground ${cls}`}
    >
      {label}
    </span>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border/60 py-2.5 last:border-b-0">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-sm text-foreground">
        {children}
      </span>
    </div>
  )
}

function ActionGroup({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-0.5">
        <h4 className="text-xs font-medium text-foreground">{title}</h4>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

// Compose the drawer's view from RPCs that exist today.
function useStudentProgressDetail(memberId: number | null) {
  const board = useProgressionBoard({ sort: "name", limit: 100, offset: 0 })

  const row = board.data?.find((r) => r.memberId === memberId) ?? null

  const matrix = useModuleMatrix(row?.levelId ?? null, null)
  const notes = useProgressNotes(memberId, 30)

  const milestones = (() => {
    if (!row || !matrix.data) return []
    const me = matrix.data.students.find((s) => s.member_id === memberId)
    const done = new Set<number>(me?.done_module_ids ?? [])
    return matrix.data.modules.map((mod) => ({
      moduleId: mod.id,
      name: mod.name,
      category: mod.category,
      description: mod.description,
      completed: done.has(mod.id),
    }))
  })()

  return {
    row,
    milestones,
    notes: notes.data ?? [],
    isLoading:
      board.isLoading || (!!row && matrix.isLoading) || notes.isLoading,
    error: board.error ?? matrix.error ?? notes.error,
  }
}

export function AccountPanel({
  id,
  onClose,
}: {
  id: string
  onClose: () => void
}) {
  return (
    <StudentProgressDrawer memberId={Number(id) || null} onClose={onClose} />
  )
}

export function StudentProgressDrawer({
  memberId,
  onClose,
}: {
  memberId: number | null
  onClose: () => void
}) {
  const detail = useStudentProgressDetail(memberId)
  const advance = useAdvanceMembersBulk()
  const [confirming, setConfirming] = useState(false)
  const [notes, setNotes] = useState("")
  const [notice, setNotice] = useState<string | null>(null)
  const [tab, setTab] = useState("progress")

  const row = detail.row
  const open = memberId !== null

  if (!open) return null

  const canAdvance = !!row?.ready
  const blockers = row
    ? [
        row.milestonesDone < row.milestonesTotal
          ? `${row.milestonesTotal - row.milestonesDone} milestone${
              row.milestonesTotal - row.milestonesDone === 1 ? "" : "s"
            } remaining`
          : null,
        row.attendanceRate30d != null && row.attendanceRate30d < 60
          ? `Attendance rate ${row.attendanceRate30d}%`
          : null,
        row.absencesInARow >= 2
          ? `${row.absencesInARow} absences in a row`
          : null,
      ].filter((x): x is string => !!x)
    : []

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABEL[category] ?? category,
    milestones: detail.milestones.filter(
      (m) => (m.category ?? "") === category
    ),
  })).filter((g) => g.milestones.length > 0)

  const hasNotes = detail.notes.length > 0
  const hasAttendance = !!row && row.attendanceRate30d != null

  async function handlePromote() {
    if (!row) return
    try {
      const rows = await advance.mutateAsync({
        memberIds: [row.memberId],
        notes: notes.trim() || null,
      })
      const res = rows[0]
      if (!res?.ok) throw new Error(res?.message ?? "Promotion failed")

      setConfirming(false)
      setNotes("")
      setNotice(`${row.fullName} moved to ${res.newLevelName ?? "next level"}.`)
      toast.add({
        title: "Level advanced",
        description: `${row.fullName} moved to ${res.newLevelName ?? "next level"}.`,
        type: "success",
        timeout: 5000,
      })
    } catch (err) {
      toast.add({
        title: "Couldn't promote",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <SidePanel
      open
      onOpenChange={(o) => !o && onClose()}
      title={row?.fullName ?? "Student progress"}
      description={row?.programmes ?? undefined}
      header={
        row && (
          <div className="flex flex-col gap-4 border-b border-border/60 px-8 pt-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-light text-base font-semibold text-foreground">
                {initials(row.fullName)}
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {row.fullName}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  Age {row.age} · {row.programmes ?? "No active programme"}
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <Pill
                    label={row.levelName ?? "No level"}
                    cls={row.noLevel ? "bg-muted" : "bg-blue-light"}
                  />
                  {row.ready ? (
                    <Pill label="Ready to advance" cls="bg-green-light" />
                  ) : row.stalled ? (
                    <Pill label="Stalled" cls="bg-orange-light" />
                  ) : row.needsAttention ? (
                    <Pill label="Needs attention" cls="bg-red-light" />
                  ) : null}
                  {row.hasMedicalNotes && (
                    <Pill label="Medical" cls="bg-red-light" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }
    >
      {detail.isLoading && (
        <div className="flex h-48 items-center justify-center">
          <Loader />
        </div>
      )}

      {detail.error && (
        <div className="m-4 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {detail.error.message}
        </div>
      )}

      {row && (
        <div className="flex flex-col gap-5 px-6 pb-6">
          {notice && (
            <div className="rounded-lg border border-green/40 bg-green-light px-3 py-2 text-xs text-foreground">
              {notice}
            </div>
          )}

          {/* Pending promote confirmation — mirrors AccountPanel's pending block */}
          {confirming && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">
                Promote to {row.nextLevelName ?? "next level"}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong className="font-semibold">{row.fullName}</strong> will
                move from {row.levelName ?? "current level"} to{" "}
                <strong className="font-semibold">
                  {row.nextLevelName ?? "next level"}
                </strong>
                . This is recorded in their level history.
              </p>
              <Field label="Note for the parent (optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </Field>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={advance.isPending}
                  className="text-xs"
                  onClick={handlePromote}
                >
                  {advance.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Promoting…
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={advance.isPending}
                  className="text-xs"
                  onClick={() => {
                    setConfirming(false)
                    setNotes("")
                  }}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex flex-col gap-3"
          >
            <TabsList className="no-scrollbar h-auto w-fit justify-start gap-1 overflow-x-auto rounded-lg bg-input p-1">
              <TabsTrigger value="progress" className={TAB_TRIGGER_CLASS}>
                Progress
              </TabsTrigger>
              <TabsTrigger value="milestones" className={TAB_TRIGGER_CLASS}>
                Milestones
              </TabsTrigger>
              {hasAttendance && (
                <TabsTrigger value="attendance" className={TAB_TRIGGER_CLASS}>
                  Attendance
                </TabsTrigger>
              )}
              {hasNotes && (
                <TabsTrigger value="notes" className={TAB_TRIGGER_CLASS}>
                  Notes
                </TabsTrigger>
              )}
              <TabsTrigger value="actions" className={TAB_TRIGGER_CLASS}>
                Actions
              </TabsTrigger>
            </TabsList>

            {/* PROGRESS */}
            <TabsContent value="progress" className="mt-0">
              <div className="flex flex-col">
                <Row label="Level">{row.levelName ?? "Not assigned"}</Row>
                <Row label="Next level">{row.nextLevelName ?? "—"}</Row>
                <Row label="Milestones">
                  <span className="tabular-nums">
                    {row.milestonesDone} / {row.milestonesTotal}
                  </span>
                </Row>
                <Row label="Progress">{row.progressPct}%</Row>
                <Row label="Last activity">
                  {row.lastActivityOn ? fmt(row.lastActivityOn) : "—"}
                </Row>
                <Row label="Days since">{row.daysSinceActivity ?? "—"}</Row>
                <Row label="Notes">{row.notesCount}</Row>
              </div>

              {row.milestonesTotal > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Milestone progress
                    </span>
                    <span className="text-foreground tabular-nums">
                      {row.milestonesDone} / {row.milestonesTotal}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-input">
                    <div
                      className="h-full bg-green"
                      style={{
                        width: `${Math.min(
                          100,
                          (row.milestonesDone / row.milestonesTotal) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* MILESTONES */}
            <TabsContent value="milestones" className="mt-0">
              {grouped.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No milestones defined for this level yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {grouped.map((group) => (
                    <div
                      key={group.category}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                        {group.label}
                      </p>
                      <ul className="mt-2 flex flex-col">
                        {group.milestones.map((m) => (
                          <li
                            key={m.moduleId}
                            className="flex items-start gap-2 border-b border-border/60 py-2 last:border-b-0"
                          >
                            {m.completed ? (
                              <CheckCircle2
                                className="mt-0.5 h-4 w-4 shrink-0 text-green"
                                strokeWidth={1.75}
                              />
                            ) : (
                              <Circle
                                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50"
                                strokeWidth={1.75}
                              />
                            )}
                            <div className="min-w-0">
                              <p
                                className={
                                  m.completed
                                    ? "text-sm text-foreground"
                                    : "text-sm text-muted-foreground"
                                }
                              >
                                {m.name}
                              </p>
                              {m.description && !m.completed && (
                                <p className="text-[11px] text-muted-foreground/70">
                                  {m.description}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ATTENDANCE */}
            {hasAttendance && (
              <TabsContent value="attendance" className="mt-0">
                <div className="flex flex-col">
                  <Row label="Rate (30 days)">
                    <span
                      className={
                        (row.attendanceRate30d ?? 0) < 60
                          ? "text-destructive"
                          : undefined
                      }
                    >
                      {row.attendanceRate30d}%
                    </span>
                  </Row>
                  <Row label="Absences in a row">
                    <span
                      className={
                        row.absencesInARow >= 2 ? "text-destructive" : undefined
                      }
                    >
                      {row.absencesInARow}
                    </span>
                  </Row>
                </div>
                {row.absencesInARow >= 2 && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-red-light p-3">
                    <AlertTriangle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
                      strokeWidth={1.75}
                    />
                    <p className="text-xs text-foreground">
                      {row.absencesInARow} absences in a row. Consider checking
                      in with the parent.
                    </p>
                  </div>
                )}
              </TabsContent>
            )}

            {/* NOTES */}
            {hasNotes && (
              <TabsContent value="notes" className="mt-0">
                <ol className="flex flex-col gap-3 border-l border-border pl-4">
                  {detail.notes.map((n) => (
                    <li key={n.id} className="relative">
                      <span className="absolute top-1.5 -left-[21px] h-2 w-2 rounded-full bg-primary" />
                      <p className="text-xs font-medium text-foreground">
                        {n.coachName ?? "Coach"}
                      </p>
                      <p className="text-xs text-muted-foreground">{n.note}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {n.sharedWithParent
                          ? "Shared with parent"
                          : "Coaches only"}{" "}
                        · {fmt(n.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            )}

            {/* ACTIONS */}
            <TabsContent value="actions" className="mt-0">
              <div className="flex flex-col gap-3">
                <ActionGroup
                  title="Progression"
                  description={
                    canAdvance
                      ? "All milestones on this level are complete. Promote when ready."
                      : "Milestones on the current level must all be complete before promotion."
                  }
                >
                  {canAdvance ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs"
                      disabled={confirming || advance.isPending}
                      onClick={() => setConfirming(true)}
                    >
                      <TrendingUp
                        className="mr-1 h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                      Promote to {row.nextLevelName ?? "next level"}
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {blockers.length > 0 ? (
                        blockers.map((b) => (
                          <p
                            key={b}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                          >
                            <AlertTriangle
                              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                              strokeWidth={1.75}
                            />
                            {b}
                          </p>
                        ))
                      ) : (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Sparkles
                            className="h-3.5 w-3.5"
                            strokeWidth={1.75}
                          />
                          Waiting on milestone completion.
                        </p>
                      )}
                    </div>
                  )}
                </ActionGroup>

                {row.hasMedicalNotes && (
                  <div className="flex flex-col gap-2 rounded-lg border border-red-light/40 bg-red-light/20 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert
                        className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                        strokeWidth={1.75}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-medium text-foreground">
                          Medical notes on file
                        </h4>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          Open the member record in admin to view details.
                          Access is audited.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </SidePanel>
  )
}
