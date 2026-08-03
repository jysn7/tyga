import { PageHeader } from "@/components/portals/shared/page-header"
import { ScheduleCalendar } from "@/components/portals/client/sessions/schedule-calendar"
import { sampleSessions } from "@/components/portals/client/sessions/schedule-sample-data"

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Schedule"
        description="Upcoming and past sessions across all your children"
      />
      <ScheduleCalendar sessions={sampleSessions} />
    </div>
  )
}
