// lib/export-schedule.ts
import type { SessionEvent } from "@/components/portals/client/sessions/schedule-calendar"

function escapeCsvField(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportScheduleToCsv(
  sessions: SessionEvent[],
  filename = "schedule.csv"
) {
  const headers = [
    "Date",
    "Start",
    "End",
    "Programme",
    "Member",
    "Venue",
    "Status",
  ]
  const rows = sessions
    .slice()
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    )
    .map((s) => [
      s.date,
      s.startTime,
      s.endTime,
      s.programmeName,
      s.memberName,
      s.venueName,
      s.status,
    ])

  const csv = [headers, ...rows]
    .map((row) => row.map((field) => escapeCsvField(String(field))).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
