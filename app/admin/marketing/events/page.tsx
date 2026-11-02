"use client"

import { useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  CalendarDays,
  Pencil,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  ImagePlus,
} from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { Button } from "@/components/ui/button"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import { ConfirmDialog } from "@/components/portals/shared/confirm-dialog"
import { toast } from "@/components/ui/toast"
import {
  useMarketingEvents,
  useDeleteMarketingEvent,
  useToggleEventPublished,
  useUpsertMarketingEvent,
  type MarketingEvent,
} from "@/hooks/admin/marketing/use-marketing-events"
import { MarketingEventPanel } from "@/components/portals/admin/marketing/events/marketing-event-panel"

const STATUS_MAP: Record<
  MarketingEvent["visibility"],
  { label: string; variant: StatusVariant }
> = {
  draft: { label: "Draft", variant: "neutral" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "warning" },
}

const FILTERS = ["all", "draft", "published", "archived"] as const
type Filter = (typeof FILTERS)[number]

export default function MarketingEventsPage() {
  const supabase = createClient()
  const { data: events, isLoading } = useMarketingEvents()
  const deleteEvent = useDeleteMarketingEvent()
  const togglePublish = useToggleEventPublished()
  const upsertEvent = useUpsertMarketingEvent()

  const [filter, setFilter] = useState<Filter>("all")
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<MarketingEvent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MarketingEvent | null>(null)

  // Track which event is currently uploading an image
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null)

  const filtered = (events ?? []).filter(
    (e) => filter === "all" || e.visibility === filter
  )

  function openCreate() {
    setEditing(null)
    setPanelOpen(true)
  }

  function openEdit(event: MarketingEvent) {
    setEditing(event)
    setPanelOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteEvent.mutateAsync(deleteTarget.id)
      toast.add({
        title: "Event deleted",
        type: "success",
        timeout: 4000,
      })
      setDeleteTarget(null)
    } catch (err) {
      toast.add({
        title: "Failed to delete event",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleToggle(event: MarketingEvent) {
    try {
      await togglePublish.mutateAsync({
        id: event.id,
        currentlyPublished: event.visibility === "published",
        event,
      })
      toast.add({
        title:
          event.visibility === "published"
            ? "Event unpublished"
            : "Event published",
        type: "success",
        timeout: 3000,
      })
    } catch (err) {
      toast.add({
        title: "Failed to update event",
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const id = uploadTargetId

    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ""

    if (!file || !id) return

    const event = events?.find((ev) => ev.id === id)
    if (!event) return

    setUploadingId(id)

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(fileName)

      // 3. Save the new URL via your existing hook
      await upsertEvent.mutateAsync({
        id: event.id,
        input: {
          name: event.name,
          type: (event.type ?? "other") as
            "clinic" | "camp" | "tournament" | "showcase" | "social" | "other",
          venueId: event.venue_id ?? 0,
          eventDate: event.event_date ?? "",
          startTime: event.start_time ?? undefined, // <--- FIX: change null to undefined
          description: event.description ?? undefined,
          imageUrl: publicUrl,
          entryFee: event.entry_fee ?? undefined,
          capacity: event.capacity ?? undefined,
          sortOrder: event.sort_order,
          visibility: event.visibility,
        },
      })

      toast.add({
        title: "Image updated",
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
      {/* Hidden file input for uploads */}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      <PageHeader
        title="Events"
        description="Upcoming events shown on the public site"
        action={
          <Button variant="secondary" size="lg" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            New event
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
            <CalendarDays
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              {filter === "all" ? "No events yet" : `No ${filter} events`}
            </span>
            <span className="text-xs text-muted-foreground">
              {filter === "all"
                ? "Create your first event to display it on the public site."
                : "Try a different filter."}
            </span>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="flex flex-col divide-y divide-border/60">
            {filtered.map((event) => {
              const status = STATUS_MAP[event.visibility]
              const isPublished = event.visibility === "published"
              const isUploading = uploadingId === event.id

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  {/* Image thumbnail (Clickable to upload) */}
                  <button
                    onClick={() => triggerUpload(event.id)}
                    disabled={isUploading}
                    title="Change image"
                    className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-input hover:opacity-80 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader className="h-4 w-4" />
                    ) : event.image_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.image_url}
                          alt={event.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
                          <ImagePlus className="h-4 w-4 text-white" />
                        </div>
                      </>
                    ) : (
                      <ImagePlus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {event.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {event.event_date
                        ? new Date(
                            `${event.event_date}T00:00:00`
                          ).toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "No date"}
                      {event.start_time
                        ? ` · ${event.start_time.slice(0, 5)}`
                        : ""}
                    </span>
                  </div>

                  {/* Status */}
                  <StatusPill label={status.label} variant={status.variant} />

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleToggle(event)}
                      disabled={togglePublish.isPending}
                      title={isPublished ? "Unpublish" : "Publish"}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                    >
                      {isPublished ? (
                        <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
                      ) : (
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(event)}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(event)}
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

      <MarketingEventPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        event={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete event"
        description={
          deleteTarget ? (
            <>
              Delete <strong>{deleteTarget.name}</strong>? This cannot be
              undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteEvent.isPending}
      />
    </div>
  )
}
