"use client"

import { useEffect, useMemo, useState } from "react"
import { Users } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { SearchInput } from "@/components/portals/shared/search-input"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useProgressionBoard,
  useProgressionSummary,
  type ProgressionBoardParams,
} from "@/hooks/coach/use-coach-progressions"
import { StudentProgressDrawer } from "@/components/portals/Coach/students/student-progress-drawer"

const PAGE_SIZE = 50

type Filter = NonNullable<ProgressionBoardParams["filter"]>
type Sort = NonNullable<ProgressionBoardParams["sort"]>

const FILTER_OPTIONS: { value: Filter | "all"; label: string }[] = [
  { value: "all", label: "All students" },
  { value: "ready", label: "Ready to advance" },
  { value: "attention", label: "Needs attention" },
  { value: "stalled", label: "Stalled" },
  { value: "in_progress", label: "In progress" },
  { value: "no_level", label: "No level" },
]

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "attention", label: "Needs attention first" },
  { value: "progress", label: "Most progress" },
  { value: "activity", label: "Longest inactive" },
  { value: "name", label: "Name A–Z" },
]

export default function MyStudentsPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [levelId, setLevelId] = useState<string>("all")
  const [filter, setFilter] = useState<Filter | "all">("all")
  const [sort, setSort] = useState<Sort>("attention")
  const [offset, setOffset] = useState(0)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)

  // Debounce search so we don't hammer the RPC on every keystroke.
  // The setState is inside a setTimeout, so it's not synchronous in the effect body.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setOffset(0)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  // Filter changes reset paging — done in the handler, not in an effect.
  const handleLevelChange = (v: string | null) => {
    setLevelId(v ?? "all")
    setOffset(0)
  }
  const handleFilterChange = (v: string | null) => {
    setFilter((v ?? "all") as Filter | "all")
    setOffset(0)
  }
  const handleSortChange = (v: string | null) => {
    setSort((v ?? "attention") as Sort)
    setOffset(0)
  }

  // Real level list + header stats. Cheap query; not paginated.
  const { data: summary } = useProgressionSummary(null)

  const levels = useMemo(
    () =>
      (summary?.levels ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((l) => ({ id: l.level_id, name: l.name, students: l.students })),
    [summary]
  )

  const {
    data: rows = [],
    isLoading,
    isFetching,
    error,
  } = useProgressionBoard({
    levelId: levelId === "all" ? null : Number(levelId),
    filter: filter === "all" ? null : filter,
    search: debouncedSearch || null,
    sort,
    limit: PAGE_SIZE,
    offset,
  })

  // `total_count` is repeated on every row by the RPC.
  const total = rows[0]?.totalCount ?? 0
  const hasMore = offset + rows.length < total

  const selectedLevelName =
    levelId === "all"
      ? "All levels"
      : (levels.find((l) => String(l.id) === levelId)?.name ?? "Level")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My students"
        description="Progress and milestones for every junior in your programmes."
      />

      {/* Header stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Students" value={summary.students} />
          <Stat
            label="Ready"
            value={summary.ready}
            tone={summary.ready > 0 ? "success" : "default"}
          />
          <Stat
            label="Stalled"
            value={summary.stalled}
            tone={summary.stalled > 0 ? "warn" : "default"}
          />
          <Stat label="Promoted (30d)" value={summary.promoted_30d} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name…"
          className="flex-1 lg:max-w-sm"
        />

        <Select value={levelId} onValueChange={handleLevelChange}>
          <SelectTrigger className="h-9 w-full text-sm lg:w-52">
            <SelectValue>{selectedLevelName}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {levels.map((l) => (
              <SelectItem key={l.id} value={String(l.id)}>
                {l.name} · {l.students}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="h-9 w-full text-sm lg:w-48">
            <SelectValue>
              {FILTER_OPTIONS.find((o) => o.value === filter)?.label ??
                "All students"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="h-9 w-full text-sm lg:w-48">
            <SelectValue>
              {SORT_OPTIONS.find((o) => o.value === sort)?.label ??
                "Needs attention first"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Roster */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            search || levelId !== "all" || filter !== "all"
              ? "No students match"
              : "No students yet"
          }
          description={
            search || levelId !== "all" || filter !== "all"
              ? "Try clearing the filters."
              : "Students appear here once they enrol in one of your programmes."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th className="px-4 py-2.5 font-medium">Student</th>
                  <th className="px-4 py-2.5 font-medium">Programme</th>
                  <th className="px-4 py-2.5 font-medium">Level</th>
                  <th className="px-4 py-2.5 font-medium">Milestones</th>
                  <th className="px-4 py-2.5 font-medium">Attendance</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.memberId}
                    tabIndex={0}
                    onClick={() => setSelectedMemberId(r.memberId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedMemberId(r.memberId)
                      }
                    }}
                    className="cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="text-foreground">{r.fullName}</p>
                        {r.hasMedicalNotes && (
                          <span
                            title="Medical notes on file"
                            className="rounded-full bg-rose/50 px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                          >
                            med
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Age {r.age}
                        {r.notesCount > 0 &&
                          ` · ${r.notesCount} note${r.notesCount === 1 ? "" : "s"}`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {r.programmes ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {r.levelName ?? "Unassigned"}
                      {r.nextLevelName && (
                        <p className="text-[11px] text-muted-foreground">
                          next: {r.nextLevelName}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-foreground tabular-nums">
                        {r.milestonesDone}/{r.milestonesTotal}
                      </span>
                      {r.milestonesTotal === 0 ? (
                        <span className="ml-2 text-[11px] text-muted-foreground">
                          no milestones
                        </span>
                      ) : (
                        <span className="ml-2 text-[11px] text-muted-foreground">
                          {r.progressPct}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.attendanceRate30d == null ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <span
                          className={
                            r.attendanceRate30d < 60
                              ? "text-sm font-medium text-destructive"
                              : "text-sm text-foreground"
                          }
                        >
                          {r.attendanceRate30d}%
                        </span>
                      )}
                      {r.absencesInARow >= 2 && (
                        <span className="ml-2 rounded-full bg-red-light px-2 py-0.5 text-[10px] font-medium text-foreground">
                          {r.absencesInARow} absent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.ready ? (
                        <span className="rounded-full bg-green-light px-2 py-0.5 text-[11px] font-medium text-foreground">
                          Ready
                        </span>
                      ) : r.stalled ? (
                        <span className="rounded-full bg-orange-light px-2 py-0.5 text-[11px] font-medium text-foreground">
                          Stalled
                        </span>
                      ) : r.needsAttention ? (
                        <span className="rounded-full bg-red-light px-2 py-0.5 text-[11px] font-medium text-foreground">
                          Attention
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              {rows.length} of {total} {total === 1 ? "student" : "students"}
              {levelId !== "all" && ` · ${selectedLevelName}`}
              {filter !== "all" &&
                ` · ${FILTER_OPTIONS.find((o) => o.value === filter)?.label}`}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={offset === 0 || isFetching}
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={!hasMore || isFetching}
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
              >
                {isFetching ? "Loading…" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <StudentProgressDrawer
        memberId={selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: number
  tone?: "default" | "success" | "warn"
}) {
  const valueClass =
    tone === "success"
      ? "text-green"
      : tone === "warn"
        ? "text-orange"
        : "text-foreground"
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${valueClass}`}>
        {value}
      </p>
    </div>
  )
}
