"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import {
  CheckCircle2,
  Circle,
  Loader2,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
  TriangleAlert,
  User,
} from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import {
  useGetMemberProgress,
  useAdvanceMemberLevel,
  useProgressNotes,
} from "@/hooks/coach/use-coach-progressions"
import {
  useAddProgressNote,
  useDeleteProgressNote,
  useMarkModuleComplete,
  useUnmarkModuleComplete,
} from "@/hooks/coach/use-coach-mutations"
import { toast } from "@/components/ui/toast"

const date = (s: string | null) => (s ? format(parseISO(s), "d MMM yyyy") : "—")

const CATEGORY_LABEL: Record<string, string> = {
  technical: "Technical",
  physical: "Physical",
  mental_character: "Mental & character",
  format: "Format & course",
}
const CATEGORY_ORDER = ["technical", "physical", "mental_character", "format"]

const ATTENDANCE_LABEL: Record<string, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  excused: "Excused",
}

const ATTENDANCE_TONE: Record<string, string> = {
  present: "bg-green-light text-foreground",
  late: "bg-orange-light text-foreground",
  absent: "bg-red-light text-foreground",
  excused: "bg-blue-light text-foreground",
}

const PROGRAMME_STATUS_TONE: Record<string, string> = {
  active: "bg-green-light text-foreground",
  pending: "bg-blue-light text-foreground",
  paused: "bg-orange-light text-foreground",
  completed: "bg-muted text-muted-foreground",
  withdrawn: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
}

export function StudentProgressDrawer({
  memberId,
  onClose,
}: {
  memberId: number | null
  onClose: () => void
}) {
  // ALL hooks go first — before any conditional return.
  const { data, isLoading, error } = useGetMemberProgress(memberId)
  const advance = useAdvanceMemberLevel()
  const addNote = useAddProgressNote()
  const deleteNote = useDeleteProgressNote()
  const markModule = useMarkModuleComplete()
  const unmarkModule = useUnmarkModuleComplete()

  const [confirming, setConfirming] = useState(false)
  const [promoteNotes, setPromoteNotes] = useState("")

  const [composerOpen, setComposerOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [noteShare, setNoteShare] = useState(false)

  const grouped = useMemo(() => {
    const milestones = data?.milestones ?? []
    return CATEGORY_ORDER.map((category) => ({
      category,
      label: CATEGORY_LABEL[category] ?? category,
      milestones: milestones.filter((m) => (m.category ?? "") === category),
    })).filter((g) => g.milestones.length > 0)
  }, [data?.milestones])

  // NOW the early return is safe — no hooks are skipped.
  if (memberId === null) return null

  const canAdvance = !!data?.canAdvance
  const blockers = data?.blockers ?? []

  async function handlePromote() {
    if (!data?.level) return
    try {
      const res = await advance.mutateAsync({
        memberId: memberId!,
        notes: promoteNotes.trim() || null,
        expectedLevelId: data.level.id,
      })
      toast.add({
        title: "Level advanced",
        description: `${data.member.fullName} moved to ${res.newLevelName}.`,
        type: "success",
        timeout: 5000,
      })
      setConfirming(false)
      setPromoteNotes("")
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

  async function handleAddNote() {
    if (!noteText.trim()) return
    try {
      await addNote.mutateAsync({
        memberId: memberId!,
        note: noteText.trim(),
        share: noteShare,
      })
      toast.add({ title: "Note added", type: "success", timeout: 3000 })
      setNoteText("")
      setNoteShare(false)
      setComposerOpen(false)
    } catch (err) {
      toast.add({
        title: "Couldn't add note",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleDeleteNote(noteId: number) {
    try {
      await deleteNote.mutateAsync({ noteId, memberId: memberId! })
      toast.add({ title: "Note deleted", type: "success", timeout: 3000 })
    } catch (err) {
      toast.add({
        title: "Couldn't delete note",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  function handleToggleMilestone(moduleId: number, completed: boolean) {
    if (completed) {
      unmarkModule.mutate(
        { memberId: memberId!, moduleId },
        {
          onError: (err) =>
            toast.add({
              title: "Couldn't undo milestone",
              description:
                err instanceof Error ? err.message : "Something went wrong",
              type: "error",
              timeout: 5000,
            }),
        }
      )
    } else {
      markModule.mutate(
        { memberId: memberId!, moduleId },
        {
          onSuccess: (res) =>
            toast.add({
              title: res.levelNowComplete
                ? "Milestone recorded · level complete"
                : "Milestone recorded",
              type: "success",
              timeout: 3000,
            }),
          onError: (err) =>
            toast.add({
              title: "Couldn't record milestone",
              description:
                err instanceof Error ? err.message : "Something went wrong",
              type: "error",
              timeout: 5000,
            }),
        }
      )
    }
  }

  return (
    <SidePanel
      open
      onOpenChange={(o) => !o && onClose()}
      title={data?.member.fullName ?? "Student progress"}
      description={
        data
          ? [
              `Age ${data.member.age}`,
              data.member.gender,
              data.programmes.map((p) => p.name).join(", "),
            ]
              .filter(Boolean)
              .join(" · ")
          : undefined
      }
      header={
        data && (
          <div className="flex flex-col gap-4 border-b border-border/60 px-8 pt-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-base font-semibold text-foreground">
                <User className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {data.member.fullName}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  Age {data.member.age}
                  {data.member.gender ? ` · ${data.member.gender}` : ""}
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  {data.level && (
                    <span className="rounded-full bg-blue-light px-2 py-0.5 text-[11px] font-medium text-foreground">
                      {data.level.name}
                    </span>
                  )}
                  {data.ready && (
                    <span className="rounded-full bg-green-light px-2 py-0.5 text-[11px] font-medium text-foreground">
                      Ready to advance
                    </span>
                  )}
                  {data.member.archived && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Archived
                    </span>
                  )}
                  {data.member.hasMedicalNotes && (
                    <span className="rounded-full bg-red-light px-2 py-0.5 text-[11px] font-medium text-foreground">
                      Medical
                    </span>
                  )}
                  {data.member.hasMedicalNotes &&
                    !data.member.hasEmergencyContact && (
                      <span
                        title="Medical notes exist but no emergency contact is recorded"
                        className="rounded-full bg-orange-light px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        No emergency contact
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        )
      }
    >
      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <Loader />
        </div>
      )}

      {error && (
        <div className="m-4 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error.message}
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-5 px-6 pb-6">
          {/* Current level + upgrade criteria */}
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Current level
              </p>
              {data.ready && (
                <span className="rounded-full bg-green-light px-2 py-0.5 text-[11px] font-medium text-foreground">
                  Ready to advance
                </span>
              )}
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {data.level?.name ?? "Not assigned"}
            </p>
            {data.level?.goal && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {data.level.goal}
              </p>
            )}
            {data.nextLevel && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" strokeWidth={1.75} />
                Next: {data.nextLevel.name}
                {data.nextLevel.goal ? ` — ${data.nextLevel.goal}` : ""}
              </p>
            )}

            {data.level?.upgradeCriteria && (
              <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  To advance
                </p>
                <p className="mt-1 text-xs text-foreground">
                  {data.level.upgradeCriteria}
                </p>
              </div>
            )}

            {data.milestonesTotal > 0 && (
              <>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Milestones</span>
                  <span className="text-foreground tabular-nums">
                    {data.milestonesDone} / {data.milestonesTotal}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-input">
                  <div
                    className="h-full bg-green"
                    style={{
                      width: `${Math.min(
                        100,
                        (data.milestonesDone / data.milestonesTotal) * 100
                      )}%`,
                    }}
                  />
                </div>
              </>
            )}
          </section>

          {/* Programmes with status */}
          {data.programmes.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Programmes
              </h3>
              <div className="overflow-hidden rounded-xl bg-card">
                {data.programmes.map((p) => (
                  <div
                    key={p.programmeId}
                    className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5 text-sm last:border-b-0"
                  >
                    <span className="text-foreground">{p.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        PROGRAMME_STATUS_TONE[p.status] ?? "bg-muted"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Milestones with metadata + inline undo */}
          {grouped.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Milestones
              </h3>
              {grouped.map((group) => (
                <div
                  key={group.category}
                  className="rounded-xl bg-card p-4 shadow-sm"
                >
                  <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                    {group.label}
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {group.milestones.map((m) => (
                      <li
                        key={m.moduleId}
                        className="flex items-start gap-2 border-t border-border/40 pt-2 first:border-t-0 first:pt-0"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleMilestone(m.moduleId, m.completed)
                          }
                          disabled={
                            markModule.isPending || unmarkModule.isPending
                          }
                          title={
                            m.completed ? "Undo milestone" : "Mark complete"
                          }
                          className="mt-0.5 shrink-0 disabled:opacity-50"
                        >
                          {m.completed ? (
                            <CheckCircle2
                              className="h-4 w-4 text-green"
                              strokeWidth={1.75}
                            />
                          ) : (
                            <Circle
                              className="h-4 w-4 text-muted-foreground/50"
                              strokeWidth={1.75}
                            />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={
                              m.completed
                                ? "text-sm text-foreground"
                                : "text-sm text-muted-foreground"
                            }
                          >
                            {m.name}
                          </p>
                          {m.completed && (
                            <p className="text-[11px] text-muted-foreground">
                              {m.completedAt ? date(m.completedAt) : "—"}
                              {m.verifiedBy ? ` · ${m.verifiedBy}` : ""}
                              {m.sessionDate ? ` · ${date(m.sessionDate)}` : ""}
                              {m.notes ? ` · “${m.notes}”` : ""}
                            </p>
                          )}
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
            </section>
          )}

          {/* Attendance breakdown */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Attendance (30 days)
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat
                label="Rate"
                value={
                  data.attendance.rate30d == null
                    ? "—"
                    : `${data.attendance.rate30d}%`
                }
                tone={
                  data.attendance.rate30d != null &&
                  data.attendance.rate30d < 60
                    ? "warn"
                    : "default"
                }
              />
              <Stat label="Marked" value={data.attendance.marked30d} />
              <Stat
                label="Absences in a row"
                value={
                  data.attendance.absencesInARow >= 2
                    ? `${data.attendance.absencesInARow}`
                    : "0"
                }
                tone={data.attendance.absencesInARow >= 2 ? "warn" : "default"}
              />
              <Stat label="Present" value={data.attendance.present} />
              <Stat label="Late" value={data.attendance.late} />
              <Stat
                label="Absent"
                value={data.attendance.absent}
                tone={data.attendance.absent >= 3 ? "warn" : "default"}
              />
            </div>
            {data.attendance.excused > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {data.attendance.excused} excused absence
                {data.attendance.excused === 1 ? "" : "s"} (not counted in rate)
              </p>
            )}
          </section>

          {/* Recent sessions */}
          {data.recentSessions.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Recent sessions
              </h3>
              <div className="overflow-hidden rounded-xl bg-card">
                {data.recentSessions.map((s) => (
                  <div
                    key={s.sessionId}
                    className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5 text-sm last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-foreground">
                        {s.programmeName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {date(s.sessionDate)}
                        {s.notesPresent ? " · notes" : ""}
                      </p>
                    </div>
                    {s.attendanceStatus ? (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          ATTENDANCE_TONE[s.attendanceStatus] ?? "bg-muted"
                        }`}
                      >
                        {ATTENDANCE_LABEL[s.attendanceStatus] ??
                          s.attendanceStatus}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        Not marked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Level history */}
          {data.history.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Level history
              </h3>
              <ol className="flex flex-col gap-3 border-l border-border pl-4">
                {data.history.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute top-1.5 -left-[21px] h-2 w-2 rounded-full bg-primary" />
                    <p className="text-sm text-foreground">
                      {h.fromLevel ?? "—"} →{" "}
                      <strong className="font-semibold">
                        {h.toLevel ?? "—"}
                      </strong>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {date(h.date)}
                      {h.coachName ? ` · ${h.coachName}` : ""}
                    </p>
                    {h.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        “{h.notes}”
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Feedback notes with composer + delete */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Feedback notes
              </h3>
              {!composerOpen && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setComposerOpen(true)}
                >
                  <Plus className="mr-1 h-3 w-3" strokeWidth={2} />
                  Add
                </Button>
              )}
            </div>

            {composerOpen && (
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  maxLength={1000}
                  placeholder="What's worth recording about this student?"
                  className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={noteShare}
                    onChange={(e) => setNoteShare(e.target.checked)}
                    className="h-3.5 w-3.5"
                  />
                  Share with parent
                </label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={!noteText.trim() || addNote.isPending}
                    onClick={handleAddNote}
                  >
                    {addNote.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save note"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={addNote.isPending}
                    onClick={() => {
                      setComposerOpen(false)
                      setNoteText("")
                      setNoteShare(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <NotesList
              memberId={memberId!}
              canDeletePending={deleteNote.isPending}
              onDelete={handleDeleteNote}
              composerOpen={composerOpen}
            />
          </section>

          {/* Medical flag */}
          {data.member.hasMedicalNotes && (
            <section className="rounded-xl border border-red-light/40 bg-red-light/20 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                  strokeWidth={1.75}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Medical notes on file
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Open the member record in admin to view details.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Next-level programmes */}
          {data.nextLevelProgrammes.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Next-level programmes
              </h3>
              <div className="overflow-hidden rounded-xl bg-card">
                {data.nextLevelProgrammes.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-2.5 text-sm last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.venueName ?? "Venue TBC"}
                        {p.spotsLeft != null
                          ? ` · ${p.spotsLeft} spot${
                              p.spotsLeft === 1 ? "" : "s"
                            } left`
                          : ""}
                      </p>
                    </div>
                    {p.eligible ? (
                      <span className="shrink-0 rounded-full bg-green-light px-2 py-0.5 text-[11px] font-medium text-foreground">
                        Eligible
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Not eligible
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Promote */}
          <section className="border-t border-border/60 pt-4">
            {canAdvance ? (
              !confirming ? (
                <Button
                  size="sm"
                  onClick={() => setConfirming(true)}
                  className="w-full sm:w-auto"
                >
                  Promote to {data.nextLevel?.name ?? "next level"}
                </Button>
              ) : (
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
                  <p className="text-sm text-foreground">
                    Promote{" "}
                    <strong className="font-semibold">
                      {data.member.fullName}
                    </strong>{" "}
                    from {data.level?.name ?? "current level"} to{" "}
                    <strong className="font-semibold">
                      {data.nextLevel?.name ?? "next level"}
                    </strong>
                    ?
                  </p>
                  <textarea
                    rows={2}
                    value={promoteNotes}
                    onChange={(e) => setPromoteNotes(e.target.value)}
                    maxLength={500}
                    placeholder="Optional note for the parent (e.g. 'Ready for the performance squad')"
                    className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={advance.isPending}
                      onClick={handlePromote}
                    >
                      {advance.isPending ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Promoting…
                        </>
                      ) : (
                        "Yes, promote"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={advance.isPending}
                      onClick={() => {
                        setConfirming(false)
                        setPromoteNotes("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <TriangleAlert
                    className="h-4 w-4 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  Not ready to promote
                </p>
                {blockers.length > 0 ? (
                  <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                    {blockers.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    All milestones on this level must be complete.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </SidePanel>
  )
}

function NotesList({
  memberId,
  canDeletePending,
  onDelete,
  composerOpen,
}: {
  memberId: number
  canDeletePending: boolean
  onDelete: (noteId: number) => void
  composerOpen: boolean
}) {
  const { data: notes = [] } = useProgressNotes(memberId, 30)

  if (notes.length === 0) {
    if (composerOpen) return null
    return (
      <p className="text-xs text-muted-foreground">
        No feedback notes yet. Add the first one.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-card">
      {notes.map((n) => (
        <div
          key={n.id}
          className="flex flex-col gap-0.5 border-b border-border/60 px-4 py-2.5 last:border-b-0"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground">
              {n.coachName ?? "Coach"}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">
                {date(n.createdAt)}
              </span>
              {n.canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(n.id)}
                  disabled={canDeletePending}
                  title="Delete note"
                  className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-accent hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{n.note}</p>
          <p className="text-[10px] text-muted-foreground/70">
            {n.sharedWithParent ? "Shared with parent" : "Coaches only"}
          </p>
        </div>
      ))}
    </div>
  )
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string | number
  tone?: "default" | "warn"
}) {
  return (
    <div className="rounded-xl bg-card p-3 shadow-sm">
      <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-semibold tabular-nums ${
          tone === "warn" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
