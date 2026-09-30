"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QueueList } from "./queue-list"

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

export function QueueTab() {
  return (
    <Tabs defaultValue="requested" className="flex flex-col gap-5">
      <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit">
        <TabsTrigger value="requested" className={TAB_TRIGGER_CLASS}>
          Requested
        </TabsTrigger>
        <TabsTrigger value="scheduled" className={TAB_TRIGGER_CLASS}>
          Scheduled
        </TabsTrigger>
      </TabsList>

      <TabsContent value="requested" className="mt-0">
        <QueueList status="requested" />
      </TabsContent>
      <TabsContent value="scheduled" className="mt-0">
        <QueueList status="scheduled" />
      </TabsContent>
    </Tabs>
  )
}
