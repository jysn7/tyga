"use client"

import { useState } from "react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { SearchInput } from "@/components/portals/shared/search-input"
import { AdminMemberList } from "@/components/portals/admin/members/member-list"
import { useMembers } from "@/hooks/admin/use-members"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { Loader } from "@/components/portals/shared/loader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ARCHIVED_OPTIONS: {
  label: string
  value: "active" | "archived" | "all"
}[] = [
  { label: "Active members", value: "active" },
  { label: "Archived members", value: "archived" },
  { label: "All members", value: "all" },
]

export default function AdminMembersPage() {
  const [archivedFilter, setArchivedFilter] = useState<
    "active" | "archived" | "all"
  >("active")
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput)

  const {
    data: members,
    isLoading,
    error,
  } = useMembers({
    search: debouncedSearch || undefined,
    archived: archivedFilter === "all" ? null : archivedFilter === "archived",
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Members"
        description="All golfers across every account, cross-family"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by member or parent name/email..."
          className="flex-1 sm:max-w-sm"
        />

        <Select
          value={archivedFilter}
          onValueChange={(v) => setArchivedFilter(v as typeof archivedFilter)}
        >
          <SelectTrigger className="h-9 w-full border border-border bg-card text-sm sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ARCHIVED_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-full w-full justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Error: {error.message}</div>
      ) : (
        <AdminMemberList members={members ?? []} />
      )}
    </div>
  )
}
