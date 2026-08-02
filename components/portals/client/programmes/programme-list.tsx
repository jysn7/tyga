"use client"

import { useState } from "react"
import {
  ProgrammeCard,
  type Programme,
} from "@/components/portals/client/programmes/programme-card"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Search, X } from "lucide-react"

export function ProgrammeList({ programmes }: { programmes: Programme[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProgrammes = programmes.filter((programme) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true

    return (
      programme.name.toLowerCase().includes(query) ||
      programme.type.toLowerCase().includes(query) ||
      programme.levelName.toLowerCase().includes(query) ||
      programme.venueName.toLowerCase().includes(query) ||
      programme.recurrenceRule.toLowerCase().includes(query)
    )
  })

  if (programmes.length === 0) {
    return (
      <EmptyState
        title="No eligible programmes right now"
        description="Check back soon, or contact TYGA if you think this is a mistake."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search Input Bar */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search programmes..."
          className="w-full rounded-md border border-border bg-background py-2 pr-9 pl-9 text-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>

      {/* Programme Cards or No Results State */}
      {filteredProgrammes.length === 0 ? (
        <EmptyState
          title="No matching programmes"
          description={`No results found for "${searchQuery}". Try searching for something else.`}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredProgrammes.map((programme) => (
            <ProgrammeCard key={programme.id} programme={programme} />
          ))}
        </div>
      )}
    </div>
  )
}
