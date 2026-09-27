"use client"

type SessionDetail = {
  session_id: number
  programme_name: string
  venue_name: string
  start_time: string
  end_time: string
  max_ratio: number
  enrolled_count: number
}

export function SessionsOverviewTab({
  detail,
}: {
  detail: SessionDetail | null
}) {
  if (!detail)
    return (
      <div className="p-4 text-sm text-gray-500">
        Loading session details...
      </div>
    )

  return (
    <div className="space-y-4 rounded-md border bg-white p-4">
      <h3 className="text-xl font-bold text-primary">
        {detail.programme_name}
      </h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-500">Venue</span>
          <span className="font-medium">{detail.venue_name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500">Time</span>
          <span className="font-medium">
            {detail.start_time} - {detail.end_time}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500">Capacity</span>
          <span className="font-medium">
            {detail.enrolled_count} / {detail.max_ratio} Enrolled
          </span>
        </div>
      </div>
    </div>
  )
}
