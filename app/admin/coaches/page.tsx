"use client"

import { useState } from "react"
import { UserPlus, Mail, ChevronDown, UserCog, Send } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { SearchInput } from "@/components/portals/shared/search-input"
import { CoachList } from "@/components/portals/admin/coaches/coach-list"
import { CreateCoachPanel } from "@/components/portals/admin/coaches/create-coach-panel"
import { EditCoachPanel } from "@/components/portals/admin/coaches/edit-coach-panel"
import { PendingInvitesPanel } from "@/components/portals/admin/coaches/pending-invites-panel"
import { InviteCoachModal } from "@/components/portals/admin/coaches/invite-coach-modal"
import { Coach, useCoaches } from "@/hooks/admin/use-coaches"
import { useCoachInvites } from "@/hooks/admin/invites/use-coach-invites"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { Loader } from "@/components/portals/shared/loader"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [invitesPanelOpen, setInvitesPanelOpen] = useState(false)

  const {
    data: coaches,
    isLoading,
    error,
  } = useCoaches({
    search: debouncedSearch || undefined,
    active: activeFilter === "all" ? undefined : activeFilter === "active",
  })

  const { data: pendingInvites } = useCoachInvites("pending")
  const pendingCount = pendingInvites?.length ?? 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Coaches"
        description="Manage coaching staff and their status"
        action={
          <div className="flex items-center gap-2">
            {/* Add coach dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button size="lg" variant="secondary">
                  <UserPlus className="h-3.5 w-3.5" />
                  Add coach
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                  <UserCog className="h-3.5 w-3.5" />
                  Promote existing parent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInviteDialogOpen(true)}>
                  <Send className="h-3.5 w-3.5" />
                  Invite by email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Pending invites as outline button with badge */}
            <Button
              size="lg"
              className="bg-green text-secondary"
              onClick={() => setInvitesPanelOpen(true)}
            >
              <Mail className="h-3.5 w-3.5" />
              Invites
              {pendingCount > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {pendingCount}
                </span>
              )}
            </Button>
          </div>
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
      <InviteCoachModal
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
      <PendingInvitesPanel
        open={invitesPanelOpen}
        onOpenChange={setInvitesPanelOpen}
        onInviteNew={() => {
          setInvitesPanelOpen(false)
          setInviteDialogOpen(true)
        }}
      />
    </div>
  )
}
