"use client"

import { useMemo } from "react"
import { useParentSchedule } from "@/hooks/shared/use-schedule"
import { SchedulePage } from "@/components/portals/shared/schedule/schedule-page"

export default function ParentSchedulePage() {
  const { from, to } = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setMonth(start.getMonth() - 1)
    const end = new Date(now)
    end.setMonth(end.getMonth() + 3)
    return { from: start.toISOString(), to: end.toISOString() }
  }, [])

  const { data, isLoading, error } = useParentSchedule(from, to)

  return (
    <SchedulePage
      title="Schedule"
      description="Your children's programme sessions and appointments."
      entries={data}
      isLoading={isLoading}
      error={error}
    />
  )
}
