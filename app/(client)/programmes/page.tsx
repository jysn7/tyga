"use client"

import { useState } from "react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { SearchInput } from "@/components/portals/shared/search-input"
import { ProgrammeList } from "@/components/portals/client/programmes/programme-list"
import { EnrollModal } from "@/components/portals/client/programmes/enroll-modal"
import { DiscountBanner } from "@/components/portals/client/programmes/discount-banner"
import { Loader } from "@/components/portals/shared/loader"
import { useProgrammes } from "@/hooks/client/use-programmes"
import { useMembers } from "@/hooks/use-members"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProgrammeListItem } from "@/lib/types"

const TYPE_OPTIONS = [
  { label: "All types", value: "all" },
  { label: "Development", value: "development" },
  { label: "Community", value: "weekly_community" },
  { label: "Holiday Camp", value: "holiday_camp" },
  { label: "Clinic", value: "clinic" },
  { label: "Corporate", value: "corporate" },
  { label: "League", value: "league" },
] as const

export default function ProgrammesPage() {
  const { data: members, isLoading: membersLoading } = useMembers()

  const [selectedMemberId, setSelectedMemberId] = useState<string>("all")
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [enrollTarget, setEnrollTarget] = useState<ProgrammeListItem | null>(
    null
  )
  const [enrollOpen, setEnrollOpen] = useState(false)

  const allProgrammes = selectedMemberId === "all"
  const memberId = allProgrammes ? null : Number(selectedMemberId)

  const { data: programmes, isLoading: programmesLoading } = useProgrammes(
    memberId,
    allProgrammes
  )

  const selectedLabel =
    selectedMemberId === "all"
      ? "All members"
      : (members?.find((m) => String(m.id) === selectedMemberId)?.fullName ??
        "Select a member")

  // Client-side filters
  const filteredProgrammes = (programmes ?? []).filter((p) => {
    const matchesSearch = debouncedSearch
      ? p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.description ?? "")
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      : true

    const matchesType = typeFilter === "all" ? true : p.type === typeFilter

    return matchesSearch && matchesType
  })

  function handleEnroll(programme: ProgrammeListItem) {
    setEnrollTarget(programme)
    setEnrollOpen(true)
  }

  const isLoading = membersLoading || programmesLoading

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Programmes"
        description={
          allProgrammes
            ? "All available programmes"
            : "Programmes your child is eligible to enroll in"
        }
        action={
          <Select
            value={selectedMemberId}
            onValueChange={(value) => {
              if (value !== null) setSelectedMemberId(value)
            }}
            disabled={membersLoading}
          >
            <SelectTrigger className="w-56">
              <SelectValue>{selectedLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All programmes</SelectItem>
              {(members ?? []).map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <DiscountBanner />

      {/* Search + filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search programmes..."
          className="flex-1 sm:max-w-sm"
        />

        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v ?? "all")}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <ProgrammeList
          programmes={filteredProgrammes}
          onEnroll={handleEnroll}
        />
      )}

      <EnrollModal
        programme={enrollTarget}
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
      />
    </div>
  )
}
