"use client"

import { useMemo } from "react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { SchedulePage } from "@/components/portals/shared/schedule/schedule-page"
import { useCoachSchedule } from "@/hooks/shared/use-schedule"

export default function CoachSchedulePage() {
  const { from, to } = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setMonth(start.getMonth() - 1)
    const end = new Date(now)
    end.setMonth(end.getMonth() + 3)
    return { from: start.toISOString(), to: end.toISOString() }
  }, [])

  const { data, isLoading, error } = useCoachSchedule(from, to)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Schedule"
        description="Your programme sessions and booked appointments."
      />
      <SchedulePage entries={data} isLoading={isLoading} error={error} />
    </div>
  )
}
