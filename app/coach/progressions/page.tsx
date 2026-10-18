"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import {
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Clock3,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { SearchInput } from "@/components/portals/shared/search-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useCoachProgressionOverview,
  type CoachProgressionStudent,
} from "@/hooks/coach/use-coach-progression-overview"
import {
  useCoachAdvanceMemberLevel,
  useCoachMemberLevelCompletion,
  useCoachSetModuleCompletion,
} from "@/hooks/coach/use-coach-progressions"
import { toast } from "@/components/ui/toast"
import { Textarea } from "@/components/ui/textarea"

const EMPTY_STUDENTS: CoachProgressionStudent[] = []

function formatDate(date: string) {
  return format(new Date(`${date}T00:00:00`), "d MMM yyyy")
}

function StudentProgressCard({
  student,
  expanded,
  nextLevelName,
  onToggle,
}: {
  student: CoachProgressionStudent
  expanded: boolean
  nextLevelName: string | null
  onToggle: () => void
}) {
  const [advanceOpen, setAdvanceOpen] = useState(false)
  const levelCompletion = useCoachMemberLevelCompletion(student.id, expanded)
  const setModuleCompletion = useCoachSetModuleCompletion()
  const advanceLevel = useCoachAdvanceMemberLevel()
  const milestoneCount = student.modules.filter(
    (module) => module.is_milestone
  ).length
  const completedMilestoneCount = student.modules.filter(
    (module) => module.is_milestone && module.completed
  ).length
  const percentComplete =
    milestoneCount === 0
      ? 100
      : Math.round((completedMilestoneCount / milestoneCount) * 100)

  function toggleModuleCompletion(moduleId: number, completed: boolean) {
    setModuleCompletion.mutate(
      { memberId: student.id, moduleId, completed },
      {
        onSuccess: () =>
          toast.add({
            title: completed ? "Module marked complete" : "Completion removed",
            type: "success",
            timeout: 3000,
          }),
        onError: (error) =>
          toast.add({
            title: "Could not update module",
            description:
              error instanceof Error ? error.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  function handleAdvance(badgeComplete: boolean, notes: string) {
    advanceLevel.mutate(
      { memberId: student.id, badgeComplete, notes },
      {
        onSuccess: () => {
          setAdvanceOpen(false)
          toast.add({
            title: `${student.fullName} advanced to ${nextLevelName}`,
            type: "success",
            timeout: 4000,
          })
        },
        onError: (error) =>
          toast.add({
            title: "Could not advance student",
            description:
              error instanceof Error ? error.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  return (
    <article className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-col gap-4 p-4 text-left transition-colors hover:bg-accent/30 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {student.fullName
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-foreground">
              {student.fullName}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {student.currentLevel?.name ?? "No level assigned"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:min-w-64 sm:justify-end">
          <div className="min-w-0 flex-1 sm:max-w-40">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-muted-foreground">Milestones</span>
              <span className="font-medium text-foreground tabular-nums">
                {completedMilestoneCount}/{milestoneCount}
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={`${student.fullName} milestone completion`}
              aria-valuemin={0}
              aria-valuemax={milestoneCount}
              aria-valuenow={completedMilestoneCount}
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
            {percentComplete}%
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="grid gap-5 border-t border-border/60 p-4 sm:p-5 lg:grid-cols-2">
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
                {student.currentLevel?.name ?? "Current"} curriculum
              </h3>
              {student.currentLevel?.goal && (
                <span className="text-right text-[11px] text-muted-foreground">
                  {student.currentLevel.goal}
                </span>
              )}
            </div>
            {student.modules.length === 0 ? (
              <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                No curriculum modules are configured for this level.
              </p>
            ) : (
              <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
                {student.modules.map((module) => (
                  <li
                    key={module.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">
                        {module.name}
                        {module.is_milestone && (
                          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                            Milestone
                          </span>
                        )}
                      </p>
                      {module.category && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground capitalize">
                          {module.category.replaceAll("_", " ")}
                        </p>
                      )}
                    </div>
                    {module.completed ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                          <Check className="h-3.5 w-3.5" />
                          Complete
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          disabled={setModuleCompletion.isPending}
                          onClick={() =>
                            toggleModuleCompletion(module.id, false)
                          }
                          aria-label={`Undo completion for ${module.name}`}
                        >
                          Undo
                        </Button>
                      </div>
                    ) : (
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          In progress
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          disabled={setModuleCompletion.isPending}
                          onClick={() =>
                            toggleModuleCompletion(module.id, true)
                          }
                        >
                          Mark complete
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3">
              {milestoneCount === 0 ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    No active milestones; eligible for advancement.
                  </p>
                  {nextLevelName ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setAdvanceOpen(true)}
                    >
                      Advance to {nextLevelName}
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No higher active level is configured.
                    </p>
                  )}
                </div>
              ) : levelCompletion.isLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Checking milestone readiness…
                </div>
              ) : levelCompletion.error ? (
                <p role="alert" className="text-xs text-destructive">
                  Could not verify milestone readiness:{" "}
                  {levelCompletion.error.message}
                </p>
              ) : levelCompletion.data ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    All current-level milestones are complete.
                  </p>
                  {nextLevelName ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setAdvanceOpen(true)}
                    >
                      Advance to {nextLevelName}
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No higher active level is configured.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Complete every active milestone to qualify for level
                  advancement.
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">
              Progression history
            </h3>
            {student.history.length === 0 ? (
              <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                No progression submissions are recorded for this student.
              </p>
            ) : (
              <ol className="divide-y divide-border/60 rounded-lg border border-border/60">
                {student.history.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-3 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {entry.fromLevel} <span aria-hidden="true">→</span>{" "}
                        {entry.toLevel}
                      </p>
                      {entry.notes && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <time
                        dateTime={entry.date}
                        className="text-[11px] text-muted-foreground"
                      >
                        {formatDate(entry.date)}
                      </time>
                      {entry.badgeComplete && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          <Award className="h-3 w-3" />
                          Badge complete
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
      <AdvanceStudentDialog
        studentName={student.fullName}
        currentLevelName={student.currentLevel?.name ?? "Current level"}
        nextLevelName={nextLevelName ?? ""}
        open={advanceOpen}
        onOpenChange={setAdvanceOpen}
        isPending={advanceLevel.isPending}
        onAdvance={handleAdvance}
      />
    </article>
  )
}

function AdvanceStudentDialog({
  studentName,
  currentLevelName,
  nextLevelName,
  open,
  onOpenChange,
  isPending,
  onAdvance,
}: {
  studentName: string
  currentLevelName: string
  nextLevelName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  onAdvance: (badgeComplete: boolean, notes: string) => void
}) {
  const [badgeComplete, setBadgeComplete] = useState(false)
  const [notes, setNotes] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Advance student</DialogTitle>
          <DialogDescription>
            Move {studentName} from {currentLevelName} to {nextLevelName}. All
            active milestones in the current level are complete. This change
            will be recorded in progression history.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={badgeComplete}
              onCheckedChange={(value) => setBadgeComplete(value === true)}
            />
            Badge complete
          </label>
          <div className="flex flex-col gap-2">
            <label htmlFor="progression-notes" className="text-sm font-medium">
              Assessment notes (optional)
            </label>
            <Textarea
              id="progression-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
              placeholder="Add notes about this progression"
              className="min-h-24 resize-y"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onAdvance(badgeComplete, notes)}
            disabled={isPending}
          >
            {isPending ? "Advancing…" : "Confirm advancement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function CoachProgressionsPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null)
  const { data, isLoading, error } = useCoachProgressionOverview()

  const students = data?.students ?? EMPTY_STUDENTS
  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return students.filter((student) => {
      const matchesSearch = student.fullName
        .toLocaleLowerCase()
        .includes(normalizedSearch)
      const matchesLevel =
        levelFilter === "all" ||
        String(student.currentLevel?.id ?? "") === levelFilter
      return matchesSearch && matchesLevel
    })
  }, [students, search, levelFilter])

  const progressingCount = students.filter((student) =>
    student.modules.some((module) => module.is_milestone && module.completed)
  ).length
  const progressionCount = students.reduce(
    (count, student) => count + student.history.length,
    0
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <PageHeader
        title="Progressions"
        description="Track your students’ curriculum progress and progression history."
        icon={TrendingUp}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          Could not load student progress: {error.message}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryTile
              icon={Users}
              label="Active students"
              value={students.length}
            />
            <SummaryTile
              icon={CircleCheck}
              label="With milestone progress"
              value={progressingCount}
            />
            <SummaryTile
              icon={Award}
              label="Progression records"
              value={progressionCount}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search students..."
              className="flex-1 sm:max-w-sm"
            />
            <Select
              value={levelFilter}
              onValueChange={(value) => {
                if (value !== null) setLevelFilter(value)
              }}
            >
              <SelectTrigger className="h-9 w-full text-sm sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {(data?.levels ?? []).map((level) => (
                  <SelectItem key={level.id} value={String(level.id)}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card px-6 py-12 text-center shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {students.length === 0
                  ? "No active students yet"
                  : "No students match your filters"}
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {students.length === 0
                  ? "Students enrolled in your programmes will appear here."
                  : "Try another name or choose a different level."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredStudents.map((student) => {
                const currentLevel = student.currentLevel
                const nextLevelName = currentLevel
                  ? (data?.levels.find(
                      (level) => level.sort_order > currentLevel.sort_order
                    )?.name ?? null)
                  : null

                return (
                  <StudentProgressCard
                    key={student.id}
                    student={student}
                    nextLevelName={nextLevelName}
                    expanded={expandedStudent === student.id}
                    onToggle={() =>
                      setExpandedStudent((current) =>
                        current === student.id ? null : student.id
                      )
                    }
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: number
}) {
  return (
    <section className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </section>
  )
}
