"use client"

import { useRef, useState } from "react"
import { ImagePlus, Pencil, Trash2, Upload, Loader2 } from "lucide-react"
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
  useGalleryImages,
  useUploadGalleryImage,
  useDeleteGalleryImage,
  useUpsertGalleryImage,
  type GalleryImage,
} from "@/hooks/admin/marketing/use-gallery"
import { GalleryImagePanel } from "@/components/portals/admin/marketing/events/gallery-image-panel"
import type { GalleryCategory } from "@/lib/validations/marketing/gallery-image"

const CATEGORIES: { value: GalleryCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "on_course", label: "On Course" },
  { value: "coaching", label: "Coaching" },
  { value: "tournaments", label: "Tournaments" },
  { value: "academy_life", label: "Academy Life" },
]

const STATUS_MAP: Record<
  GalleryImage["visibility"],
  { label: string; variant: StatusVariant }
> = {
  draft: { label: "Draft", variant: "neutral" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "warning" },
}

function GalleryCardSkeleton() {
  return (
    <div className="mb-4 break-inside-avoid rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="h-48 w-full animate-pulse bg-muted" />
      <div className="flex items-center justify-between p-3">
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="flex gap-1">
          <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
          <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const { data: images, isLoading } = useGalleryImages()
  const upload = useUploadGalleryImage()
  const upsert = useUpsertGalleryImage()
  const deleteImage = useDeleteGalleryImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [category, setCategory] = useState<GalleryCategory | "all">("all")
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryImage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})

  const filtered = (images ?? []).filter(
    (img) => category === "all" || img.category === category
  )

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      try {
        const { url } = await upload.mutateAsync(file)
        await upsert.mutateAsync({
          input: {
            imageUrl: url,
            altText: "",
            category: category === "all" ? "on_course" : category,
            caption: "",
            sortOrder: 0,
            visibility: "draft",
          },
        })
      } catch (err) {
        toast.add({
          title: "Upload failed",
          description:
            err instanceof Error ? err.message : "Something went wrong",
          type: "error",
          timeout: 5000,
        })
      }
    }

    toast.add({
      title: `${files.length} image${files.length === 1 ? "" : "s"} uploaded`,
      description: "Images are saved as drafts. Add alt text to publish.",
      type: "success",
      timeout: 5000,
    })

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteImage.mutateAsync(deleteTarget.id)
      toast.add({
        title: "Image deleted",
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
        title="Gallery"
        description="Categorised images for the public gallery"
        action={
          <Button
            size="sm"
            className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
          >
            {upload.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            {upload.isPending ? "Uploading..." : "Upload images"}
          </Button>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              category === c.value
                ? "bg-foreground text-background"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          <GalleryCardSkeleton />
          <GalleryCardSkeleton />
          <GalleryCardSkeleton />
          <GalleryCardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
            <ImagePlus
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <span className="text-sm font-semibold text-foreground">
            No images in this category
          </span>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {filtered.map((img) => {
            const status = STATUS_MAP[img.visibility]
            const isLoaded = loadedImages[img.id]

            return (
              <div
                key={img.id}
                className="group relative mb-4 flex break-inside-avoid flex-col overflow-hidden rounded-xl bg-card shadow"
              >
                <div className="relative w-full bg-muted">
                  {!isLoaded && (
                    <div className="flex h-48 w-full items-center justify-center bg-muted">
                      <Loader />
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={img.alt_text || "Gallery image"}
                    onLoad={() =>
                      setLoadedImages((prev) => ({ ...prev, [img.id]: true }))
                    }
                    className={`h-auto w-full transition-opacity duration-300 ${
                      isLoaded ? "opacity-100" : "absolute inset-0 opacity-0"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 p-3">
                  <StatusPill label={status.label} variant={status.variant} />

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditing(img)
                        setPanelOpen(true)
                      }}
                      title="Edit"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(img)}
                      title="Delete"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>

                {!img.alt_text && (
                  <div className="border-t border-border/60 bg-amber-500/10 px-3 py-1.5">
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      Alt text required to publish
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <GalleryImagePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        image={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete image"
        description="This will remove the image from the gallery. It cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteImage.isPending}
      />
    </div>
  )
}
