// app/(admin)/coaches/page.tsx
"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { SearchInput } from "@/components/portals/shared/search-input"
import { CoachList } from "@/components/portals/admin/coaches/coach-list"
import { CreateCoachPanel } from "@/components/portals/admin/coaches/create-coach-panel"
import { Coach, useCoaches } from "@/hooks/admin/use-coaches"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { Loader } from "@/components/portals/shared/loader"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EditCoachPanel } from "@/components/portals/admin/coaches/edit-coach-panel"

const ACTIVE_OPTIONS: {
  label: string
  value: "all" | "active" | "inactive"
}[] = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

export default function AdminCoachesPage() {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all")
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null)

  const {
    data: coaches,
    isLoading,
    error,
  } = useCoaches({
    search: debouncedSearch || undefined,
    active: activeFilter === "all" ? undefined : activeFilter === "active",
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Coaches"
        description="Manage coaching staff and their status"
        action={
          <Button
            size="sm"
            className="gap-1.5 rounded-lg text-xs"
            onClick={() => setCreateOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add coach
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by name or email..."
          className="flex-1 sm:max-w-sm"
        />

        <Select
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as typeof activeFilter)}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIVE_OPTIONS.map((opt) => (
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
        <CoachList coaches={coaches ?? []} onEdit={setEditingCoach} />
      )}
      <EditCoachPanel
        key={editingCoach ? `coach-${editingCoach.id}` : "new-coach"}
        coach={editingCoach}
        open={editingCoach !== null}
        onOpenChange={(open) => !open && setEditingCoach(null)}
      />
      <CreateCoachPanel open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
