"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsHeadCoach } from "@/hooks/coach/use-coach-appointments"
import { MyAvailabilityTab } from "@/components/portals/Coach/appointments/my-availability-tab"
import { RecurringTab } from "@/components/portals/Coach/appointments/recurring-tab"
import { BookedTab } from "@/components/portals/Coach/appointments/booked-tab"
import { QueueTab } from "@/components/portals/Coach/appointments/queue-tab"

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

export default function CoachAppointmentsPage() {
  const { data: isHeadCoach } = useIsHeadCoach()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Appointments
        </h1>
        <p className="text-sm text-muted-foreground">
          {isHeadCoach
            ? "Publish availability, confirm requests, and record outcomes."
            : "Publish availability and see who has booked you."}
        </p>
      </div>

      <Tabs defaultValue="recurring" className="flex flex-col gap-5">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit">
          <TabsTrigger value="recurring" className={TAB_TRIGGER_CLASS}>
            Recurring
          </TabsTrigger>
          <TabsTrigger value="availability" className={TAB_TRIGGER_CLASS}>
            One-off slots
          </TabsTrigger>
          <TabsTrigger value="booked" className={TAB_TRIGGER_CLASS}>
            Booked
          </TabsTrigger>
          {isHeadCoach && (
            <TabsTrigger value="queue" className={TAB_TRIGGER_CLASS}>
              Queue
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="recurring" className="mt-0">
          <RecurringTab />
        </TabsContent>

        <TabsContent value="availability" className="mt-0">
          <MyAvailabilityTab />
        </TabsContent>

        <TabsContent value="booked" className="mt-0">
          <BookedTab />
        </TabsContent>

        {isHeadCoach && (
          <TabsContent value="queue" className="mt-0">
            <QueueTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
