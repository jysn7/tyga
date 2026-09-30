"use client"

import { useMemo } from "react"
import { useCoachSchedule } from "@/hooks/shared/use-schedule"
import { SchedulePage } from "@/components/portals/shared/schedule/schedule-page"

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
    <SchedulePage
      title="Schedule"
      description="Your programme sessions and booked appointments."
      entries={data}
      isLoading={isLoading}
      error={error}
    />
  )
}
