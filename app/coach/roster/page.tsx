"use client"

import { useMemo, useState } from "react"
import { Users } from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Loader } from "@/components/portals/shared/loader"
import { PageHeader } from "@/components/portals/shared/page-header"
import { useCoachRoster } from "@/hooks/coach/use-sessions"

export default function CoachRosterPage() {
  const { data: roster, isLoading, error, refetch } = useCoachRoster()
  const [programmeFilter, setProgrammeFilter] = useState("all")

  const programmes = useMemo(() => {
    const unique = new Map<number, string>()
    for (const member of roster ?? []) {
      unique.set(member.programme_id, member.programme_name)
    }
    return [...unique.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [roster])

  const filteredRoster = useMemo(
    () =>
      (roster ?? []).filter(
        (member) =>
          programmeFilter === "all" ||
          String(member.programme_id) === programmeFilter
      ),
    [programmeFilter, roster]
  )

  const groupedRoster = useMemo(() => {
    const groups = new Map<
      number,
      { programmeName: string; members: typeof filteredRoster }
    >()
    for (const member of filteredRoster) {
      const group = groups.get(member.programme_id) ?? {
        programmeName: member.programme_name,
        members: [],
      }
      group.members.push(member)
      groups.set(member.programme_id, group)
    }
    return [...groups.entries()]
  }, [filteredRoster])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="My roster"
        description="Active members enrolled in programmes you teach."
        icon={Users}
      />

      {programmes.length > 1 && (
        <div className="flex flex-col gap-2 sm:w-72">
          <label
            htmlFor="roster-programme-filter"
            className="text-xs font-medium text-muted-foreground"
          >
            Filter by programme
          </label>
          <select
            id="roster-programme-filter"
            value={programmeFilter}
            onChange={(event) => setProgrammeFilter(event.target.value)}
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
          >
            <option value="all">All programmes</option>
            {programmes.map(([id, name]) => (
              <option key={id} value={String(id)}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
        >
          <span>Could not load your roster: {error.message}</span>
          <button
            type="button"
            onClick={() => void refetch()}
            className="w-fit rounded-md border border-destructive/40 px-3 py-1.5 font-medium hover:bg-destructive/10"
          >
            Retry
          </button>
        </div>
      ) : filteredRoster.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No active members"
          description="Members with active enrollments in your programmes will appear here."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {groupedRoster.map(([programmeId, group]) => (
            <section
              key={programmeId}
              aria-label={`${group.programmeName} roster`}
              className="overflow-hidden rounded-xl bg-card shadow"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {group.programmeName}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {group.members.length} member
                  {group.members.length === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="divide-y divide-border/60">
                {group.members.map((member) => (
                  <li
                    key={`${member.programme_id}-${member.member_id}`}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {member.full_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {member.current_level_name ?? "Level not set"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
