"use client"

type CalendarSession = {
  session_id: number
  programme_name: string
  session_date: string
  start_time: string
  end_time: string
  venue_name: string
  enrolled_count: number
}

export function ScheduleCalendar({
  sessions,
}: {
  sessions: CalendarSession[]
}) {
  return (
    <div className="rounded-md border bg-white shadow-sm">
      <div className="border-b bg-gray-50 p-4">
        <h3 className="text-lg font-bold">Upcoming Schedule</h3>
      </div>

      <div className="divide-y">
        {!sessions || sessions.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No sessions scheduled for this period.
          </div>
        ) : (
          sessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
            >
              <div>
                <div className="font-medium text-primary">
                  {session.programme_name}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {session.session_date} | {session.venue_name}
                </div>
              </div>
              <div className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium">
                {session.start_time} - {session.end_time}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
