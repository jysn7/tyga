"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { SearchInput } from "@/components/portals/shared/search-input"
import { Loader } from "@/components/portals/shared/loader"
import { VenueList } from "@/components/portals/admin/venues/venue-list"
import { VenueFormPanel } from "@/components/portals/admin/venues/venue-form-panel"
import { useVenues, type AdminVenue } from "@/hooks/admin/venues/use-venues"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { Button } from "@/components/ui/button"

export default function VenuesPage() {
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput)
  const {
    data: venues,
    isLoading,
    error,
  } = useVenues({ search: debouncedSearch || undefined })

  const [panelOpen, setPanelOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<AdminVenue | null>(null)

  function handleCreate() {
    setEditingVenue(null)
    setPanelOpen(true)
  }

  function handleEdit(venue: AdminVenue) {
    setEditingVenue(venue)
    setPanelOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Venues"
        description="Locations TYGA operates across"
        action={
          <Button size="lg" variant="secondary" onClick={handleCreate}>
            <Plus className="h-3.5 w-3.5" />
            Add venue
          </Button>
        }
      />

      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search venues..."
        className="sm:max-w-sm"
      />

      {isLoading ? (
        <div className="flex h-full w-full justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Error: {error.message}</div>
      ) : (
        <VenueList venues={venues ?? []} onEdit={handleEdit} />
      )}

      <VenueFormPanel
        key={`${editingVenue?.id ?? "new"}-${panelOpen ? "open" : "closed"}`}
        venue={editingVenue}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  )
}
