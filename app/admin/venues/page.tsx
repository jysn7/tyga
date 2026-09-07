"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { VenueList } from "@/components/portals/admin/venues/venue-list"
import { VenueFormPanel } from "@/components/portals/admin/venues/venue-form-panel"
import { sampleVenues } from "@/components/portals/admin/venues/venue-sample-data"
import { Button } from "@/components/ui/button"

export default function VenuesPage() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Venues"
        description="Locations TYGA operates across"
        action={
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add venue
          </Button>
        }
      />
      <VenueList venues={sampleVenues} />
      <VenueFormPanel
        venue={null}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  )
}
