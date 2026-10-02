"use client"

import { useMemo, useState } from "react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { useParentSchedule } from "@/hooks/shared/use-schedule"
import { useMembers } from "@/hooks/use-members"
import { SchedulePage } from "@/components/portals/shared/schedule/schedule-page"

export default function ParentSchedulePage() {
  const [memberFilter, setMemberFilter] = useState("all")
  const { data: members } = useMembers()

  const { from, to } = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setMonth(start.getMonth() - 1)
    const end = new Date(now)
    end.setMonth(end.getMonth() + 3)
    return { from: start.toISOString(), to: end.toISOString() }
  }, [])

  const memberId = memberFilter === "all" ? null : Number(memberFilter)
  const { data, isLoading, error } = useParentSchedule(from, to, memberId)

  const filters =
    members && members.length > 1
      ? [
          {
            key: "member",
            label: "All children",
            value: memberFilter,
            onChange: setMemberFilter,
            options: [
              { value: "all", label: "All children" },
              ...members.map((m) => ({
                value: m.id,
                label: m.fullName,
              })),
            ],
          },
        ]
      : undefined

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Schedule"
        description="Your children's programme sessions and appointments"
      />
      <SchedulePage
        entries={data}
        isLoading={isLoading}
        error={error}
        filters={filters}
      />
    </div>
  )
}
