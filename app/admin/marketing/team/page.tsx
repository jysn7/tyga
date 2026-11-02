"use client"

import { useRef, useState } from "react"
import { Users, Pencil, Trash2, Plus, ImagePlus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import { ConfirmDialog } from "@/components/portals/shared/confirm-dialog"
import { toast } from "@/components/ui/toast"
import { Loader } from "@/components/portals/shared/loader"
import { uploadTeamImage } from "@/hooks/admin/marketing/upload-team-image"
import {
  useTeamMembers,
  useDeleteTeamMember,
  useSetTeamMemberImage,
  type TeamMember,
} from "@/hooks/admin/marketing/use-team-members"
import { TeamMemberPanel } from "@/components/portals/admin/marketing/events/team-member-panel"

const STATUS_MAP: Record<
  TeamMember["visibility"],
  { label: string; variant: StatusVariant }
> = {
  draft: { label: "Draft", variant: "neutral" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "warning" },
}

const FILTERS = ["all", "draft", "published", "archived"] as const
type Filter = (typeof FILTERS)[number]

function TeamMemberRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
      <div className="flex shrink-0 gap-1">
        <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}

export default function TeamMembersPage() {
  const { data: members, isLoading } = useTeamMembers()
  const deleteMember = useDeleteTeamMember()
  const setTeamImage = useSetTeamMemberImage()

  const [filter, setFilter] = useState<Filter>("all")
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null)

  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null)

  const filtered = (members ?? []).filter(
    (m) => filter === "all" || m.visibility === filter
  )

  function openCreate() {
    setEditing(null)
    setPanelOpen(true)
  }

  function openEdit(m: TeamMember) {
    setEditing(m)
    setPanelOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMember.mutateAsync(deleteTarget.id)
      toast.add({
        title: "Team member deleted",
        type: "success",
        timeout: 4000,
      })
      setDeleteTarget(null)
    } catch (err) {
      toast.add({
        title: "Failed to delete",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  function triggerUpload(id: number) {
    setUploadTargetId(id)
    fileInputRef.current?.click()
  }

  async function handleListImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const id = uploadTargetId

    if (fileInputRef.current) fileInputRef.current.value = ""
    if (!file || !id) return

    setUploadingId(id)

    try {
      const publicUrl = await uploadTeamImage(file)

      await setTeamImage.mutateAsync({
        id: id,
        url: publicUrl,
      })

      toast.add({
        title: "Portrait updated",
        type: "success",
        timeout: 3000,
      })
    } catch (err) {
      toast.add({
        title: "Failed to upload image",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    } finally {
      setUploadingId(null)
      setUploadTargetId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleListImageUpload}
      />

      <PageHeader
        title="Team"
        description="Staff profiles shown on the About page"
        action={
          <Button
            size="sm"
            className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
            onClick={openCreate}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
            Add member
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-foreground text-background"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="flex flex-col divide-y divide-border/60">
            <TeamMemberRowSkeleton />
            <TeamMemberRowSkeleton />
            <TeamMemberRowSkeleton />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
            <Users
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {filter === "all" ? "No team members yet" : `No ${filter} members`}
          </span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="flex flex-col divide-y divide-border/60">
            {filtered.map((m) => {
              const status = STATUS_MAP[m.visibility]
              const isUploading = uploadingId === m.id

              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3.5">
                  <button
                    onClick={() => triggerUpload(m.id)}
                    disabled={isUploading}
                    title="Change portrait"
                    className="group relative shrink-0 overflow-hidden rounded-full disabled:opacity-50"
                  >
                    <Avatar className="h-11 w-11 rounded-full">
                      {m.portrait_url && !isUploading && (
                        <AvatarImage
                          src={m.portrait_url}
                          alt={m.display_name}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-input text-xs font-semibold text-primary">
                        {isUploading ? (
                          <Loader className="h-4 w-4" />
                        ) : (
                          <Users
                            className="h-4 w-4 text-muted-foreground"
                            strokeWidth={1.75}
                          />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {!isUploading && (
                      <div className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
                        <ImagePlus className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {m.display_name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {m.role_title}
                    </span>
                  </div>

                  <StatusPill label={status.label} variant={status.variant} />

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => openEdit(m)}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(m)}
                      title="Delete"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <TeamMemberPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        member={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete team member"
        description={
          deleteTarget ? (
            <>
              Delete <strong>{deleteTarget.display_name}</strong>?
            </>
          ) : null
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMember.isPending}
      />
    </div>
  )
}
