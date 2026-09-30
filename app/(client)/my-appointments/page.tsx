"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrowseSlotsTab } from "@/components/portals/client/appointments/browse-slots-tab"
import { MyAppointmentsTab } from "@/components/portals/client/appointments/my-appointments-tab"

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

export default function ParentAppointmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Appointments
        </h1>
        <p className="text-sm text-muted-foreground">
          Book an assessment or consultation for your child.
        </p>
      </div>

      <Tabs defaultValue="browse" className="flex flex-col gap-5">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit">
          <TabsTrigger value="browse" className={TAB_TRIGGER_CLASS}>
            Browse slots
          </TabsTrigger>
          <TabsTrigger value="mine" className={TAB_TRIGGER_CLASS}>
            My appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-0">
          <BrowseSlotsTab />
        </TabsContent>

        <TabsContent value="mine" className="mt-0">
          <MyAppointmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
