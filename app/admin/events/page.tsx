"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { EventList } from "@/components/portals/admin/events/event-list"
import { CreateEventModal } from "@/components/portals/admin/events/create-event-modal"
import { useEvents } from "@/hooks/admin/events/use-events"
import { Loader } from "@/components/portals/shared/loader"
import { Button } from "@/components/ui/button"

export default function EventsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: events, isLoading } = useEvents()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Events"
        description="Tournaments and community events"
        action={
          <Button
            size="lg"
            variant="secondary"
            className="gap-1.5 rounded-lg text-xs"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add event
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <EventList events={events ?? []} />
      )}

      <CreateEventModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
