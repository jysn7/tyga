"use client"

import { useState } from "react"
import { LayoutGrid, Pencil, Trash2, Plus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import { ConfirmDialog } from "@/components/portals/shared/confirm-dialog"
import { toast } from "@/components/ui/toast"
import {
  useMarketingProgrammes,
  useDeleteMarketingProgramme,
  type MarketingProgramme,
} from "@/hooks/admin/marketing/use-marketing-programmes"
import { MarketingProgrammePanel } from "@/components/portals/admin/marketing/events/marketing-programme-panel"

const STATUS_MAP: Record<
  MarketingProgramme["visibility"],
  { label: string; variant: StatusVariant }
> = {
  draft: { label: "Draft", variant: "neutral" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "warning" },
}

const FILTERS = ["all", "draft", "published", "archived"] as const
type Filter = (typeof FILTERS)[number]

function getInitials(title: string) {
  return title
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

function ProgrammeRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-muted" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="hidden h-3 w-20 animate-pulse rounded bg-muted sm:block" />
      <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
      <div className="flex shrink-0 gap-1">
        <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}

export default function MarketingProgrammesPage() {
  const { data: programmes, isLoading } = useMarketingProgrammes()
  const deleteProgramme = useDeleteMarketingProgramme()

  const [filter, setFilter] = useState<Filter>("all")
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<MarketingProgramme | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MarketingProgramme | null>(
    null
  )

  const filtered = (programmes ?? []).filter(
    (p) => filter === "all" || p.visibility === filter
  )

  function openCreate() {
    setEditing(null)
    setPanelOpen(true)
  }

  function openEdit(p: MarketingProgramme) {
    setEditing(p)
    setPanelOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteProgramme.mutateAsync(deleteTarget.id)
      toast.add({
        title: "Programme deleted",
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Marketing Programmes"
        description="Public programme cards, linked to operational programmes"
        action={
          <Button
            size="sm"
            className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
            onClick={openCreate}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
            New card
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
            <ProgrammeRowSkeleton />
            <ProgrammeRowSkeleton />
            <ProgrammeRowSkeleton />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
            <LayoutGrid
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {filter === "all" ? "No programme cards yet" : `No ${filter} cards`}
          </span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="flex flex-col divide-y divide-border/60">
            {filtered.map((p) => {
              const status = STATUS_MAP[p.visibility]

              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                  <Avatar className="h-11 w-11 shrink-0 rounded-lg">
                    {p.image_url && (
                      <AvatarImage
                        src={p.image_url}
                        alt={p.display_title}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(p.display_title)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {p.display_title}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {p.programme_id
                        ? `Linked to programme #${p.programme_id}`
                        : "Not linked to a programme"}
                    </span>
                  </div>

                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {p.price_override != null
                      ? "Override price"
                      : "Uses live price"}
                  </span>

                  <StatusPill label={status.label} variant={status.variant} />

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
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

      <MarketingProgrammePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        programme={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete programme card"
        description={
          deleteTarget ? (
            <>
              Delete <strong>{deleteTarget.display_title}</strong>? This removes
              it from the public site. The operational programme is not
              affected.
            </>
          ) : null
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteProgramme.isPending}
      />
    </div>
  )
}
