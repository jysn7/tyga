"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { SearchInput } from "@/components/portals/shared/search-input"
import { Loader } from "@/components/portals/shared/loader"
import { MemberList } from "@/components/portals/client/members/member-list"
import { useMembers } from "@/hooks/use-members"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function MembersPage() {
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput)
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">(
    "all"
  )
  const [archivedFilter, setArchivedFilter] = useState<"active" | "all">(
    "active"
  )

  const {
    data: members,
    isLoading,
    error,
  } = useMembers({
    search: debouncedSearch || undefined,
    gender: genderFilter === "all" ? undefined : genderFilter,
    includeArchived: archivedFilter === "all",
  })

  if (isLoading)
    return (
      <div className="flex h-full w-full justify-center">
        <Loader />
      </div>
    )

  if (error) {
    console.error("useMembers error:", error)
    return (
      <div className="text-sm text-destructive">Error: {error.message}</div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Members"
        description="Manage your children's profiles, placement, and progress"
        action={
          <Link
            href="/members/new"
            className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-3 text-xs text-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Member
          </Link>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search members..."
          className="flex-1 sm:max-w-sm"
        />

        <Select
          value={genderFilter}
          onValueChange={(v) => setGenderFilter(v as "all" | "male" | "female")}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-36">
            <SelectValue placeholder="All genders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={archivedFilter}
          onValueChange={(v) => setArchivedFilter(v as "active" | "all")}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="all">Include archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <MemberList members={members ?? []} viewerRole="client" />
    </div>
  )
}
