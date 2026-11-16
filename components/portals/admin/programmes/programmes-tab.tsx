"use client"

import { useState } from "react"
import { SearchInput } from "@/components/portals/shared/search-input"
import { Loader } from "@/components/portals/shared/loader"
import { ProgrammeList } from "@/components/portals/admin/programmes/programme-list"
import { EditProgrammePanel } from "@/components/portals/admin/programmes/edit-programme-panel"
import { SessionsModal } from "@/components/portals/admin/programmes/sessions-modal"
import { RolloverProgrammeDialog } from "@/components/portals/admin/programmes/rollover-dialog"
import {
  useProgrammes,
  type AdminProgramme,
} from "@/hooks/admin/programmes/use-programmes"
import { useVenues } from "@/hooks/admin/programmes/use-venues"
import { useLevels } from "@/hooks/admin/levels/use-levels"
import { useCoaches } from "@/hooks/admin/use-coaches"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ProgrammesTab() {
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput)
  const [levelFilter, setLevelFilter] = useState("all")
  const [archivedFilter, setArchivedFilter] = useState<
    "active" | "archived" | "all"
  >("active")

  const { data: levels } = useLevels()
  const { data: venues } = useVenues()
  const { data: coaches } = useCoaches()

  const {
    data: programmes,
    isLoading,
    error,
    refetch,
  } = useProgrammes({
    search: debouncedSearch || undefined,
    levelId: levelFilter === "all" ? undefined : Number(levelFilter),
    archived: archivedFilter === "all" ? null : archivedFilter === "archived",
  })

  const [editPanelOpen, setEditPanelOpen] = useState(false)
  const [editingProgramme, setEditingProgramme] =
    useState<AdminProgramme | null>(null)
  const [sessionsProgramme, setSessionsProgramme] =
    useState<AdminProgramme | null>(null)
  const [rolloverProgramme, setRolloverProgramme] =
    useState<AdminProgramme | null>(null)

  function handleEdit(programme: AdminProgramme) {
    setEditingProgramme(programme)
    setEditPanelOpen(true)
  }

  function handleManageSessions(programme: AdminProgramme) {
    setSessionsProgramme(programme)
  }

  function handleRollover(programme: AdminProgramme) {
    setRolloverProgramme(programme)
  }

  function handleEditPanelOpenChange(open: boolean) {
    setEditPanelOpen(open)
    if (!open) {
      refetch()
      setEditingProgramme(null)
    }
  }

  function handleSessionsModalOpenChange(open: boolean) {
    if (!open) {
      refetch()
      setSessionsProgramme(null)
    }
  }

  function handleRolloverDialogOpenChange(open: boolean) {
    if (!open) {
      refetch()
      setRolloverProgramme(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search programmes..."
          className="flex-1 sm:max-w-sm"
        />

        <Select
          value={levelFilter}
          onValueChange={(value) => setLevelFilter(value ?? "all")}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-40">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {(levels ?? []).map((l) => (
              <SelectItem key={l.id} value={l.id.toString()}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={archivedFilter}
          onValueChange={(v) => setArchivedFilter(v as typeof archivedFilter)}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Error loading programmes: {error.message}
        </div>
      ) : (
        <ProgrammeList
          programmes={programmes ?? []}
          onEdit={handleEdit}
          onManageSessions={handleManageSessions}
          onRollover={handleRollover}
        />
      )}

      <EditProgrammePanel
        key={`edit-${editingProgramme?.id ?? "none"}-${editPanelOpen}`}
        programme={editingProgramme}
        levels={levels ?? []}
        venues={venues ?? []}
        coaches={coaches ?? []}
        open={editPanelOpen}
        onOpenChange={handleEditPanelOpenChange}
      />

      <SessionsModal
        programmeId={sessionsProgramme?.id ?? null}
        programmeName={sessionsProgramme?.name}
        open={!!sessionsProgramme}
        onOpenChange={handleSessionsModalOpenChange}
      />

      <RolloverProgrammeDialog
        sourceProgramme={rolloverProgramme}
        open={!!rolloverProgramme}
        onOpenChange={handleRolloverDialogOpenChange}
      />
    </div>
  )
}
