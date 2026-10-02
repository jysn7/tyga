"use client"

import { useState } from "react"
import { useCoachRoster, type RosterEntry } from "@/hooks/coach/use-roster"
import { secondaryButtonClass, inputClass } from "@/components/portals/shared/form-styles"
import { SubmitProgressionModal } from "./submit-progression-modal"

export function RosterView() {
  const { data, isLoading, error } = useCoachRoster()
  const [programmeId, setProgrammeId] = useState("all")
  const [selected, setSelected] = useState<RosterEntry | null>(null)

  const roster = data ?? []

  // Build the filter dropdown from the data. A Map removes duplicates,
  // because a programme appears once per child in it.
  const programmes = Array.from(
    new Map(roster.map((r) => [r.programmeId, r.programmeName])).entries()
  )

  const visible =
    programmeId === "all"
      ? roster
      : roster.filter((r) => r.programmeId === Number(programmeId))

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>
  if (error) return <p className="text-sm text-red-600">{error.message}</p>

  if (roster.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No active members yet. Children appear here once they are enrolled in a
        programme you coach.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <label htmlFor="programme-filter" className="sr-only">
          Filter by programme
        </label>
        <select
          id="programme-filter"
          className={inputClass}
          value={programmeId}
          onChange={(e) => setProgrammeId(e.target.value)}
        >
          <option value="all">All programmes ({roster.length})</option>
          {programmes.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* overflow-x-auto lets the table scroll sideways on a phone */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-2 font-medium">Member</th>
              <th className="px-4 py-2 font-medium">Programme</th>
              <th className="px-4 py-2 font-medium">Level</th>
              <th className="px-4 py-2 font-medium">Attendance</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {visible.map((entry) => (
              <tr key={entry.enrollmentId} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{entry.memberName}</p>
                  <p className="text-xs text-muted-foreground">Age {entry.memberAge}</p>
                </td>
                <td className="px-4 py-3">{entry.programmeName}</td>
                <td className="px-4 py-3">{entry.currentLevelName ?? "Not placed yet"}</td>
                <td className="px-4 py-3">
                  {entry.attendanceRate === null ? "-" : `${entry.attendanceRate}%`}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className={secondaryButtonClass}
                    onClick={() => setSelected(entry)}
                  >
                    Submit progression
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SubmitProgressionModal member={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
