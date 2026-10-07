"use client"

import Image from "next/image"
import { useState } from "react"
import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { toast } from "@/components/ui/toast"
import {
  GALLERY_CATEGORIES,
  type GalleryImage,
} from "@/hooks/admin/gallery/use-gallery"
import { useDeleteGalleryImage } from "@/hooks/admin/gallery/use-gallery-mutations"
import { EditGalleryImagePanel } from "./edit-gallery-image-panel"

const categoryName = (category: GalleryImage["category"]) =>
  GALLERY_CATEGORIES.find((entry) => entry.value === category)?.label ??
  category

export function GalleryImageList({ images }: { images: GalleryImage[] }) {
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const deleteImage = useDeleteGalleryImage()

  async function handleDelete(image: GalleryImage) {
    if (!window.confirm(`Delete "${image.caption || "this gallery image"}"?`)) {
      return
    }

    setDeletingId(image.id)
    try {
      const result = await deleteImage.mutateAsync(image)
      toast.add(
        result.storageCleanupFailed
          ? {
              title: "Gallery entry deleted",
              description:
                "The image file could not be removed from storage. Please clean it up from Supabase Storage.",
              type: "error",
              timeout: 7000,
            }
          : { title: "Gallery image deleted", type: "success", timeout: 4000 }
      )
    } catch (error) {
      toast.add({
        title: "Failed to delete gallery image",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        type: "error",
        timeout: 5000,
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (images.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="The gallery is empty"
        description="Add photos and publish them to make them visible on the public gallery."
      />
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => (
          <article
            key={image.id}
            className="overflow-hidden rounded-xl border border-border/60 bg-card"
          >
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                src={image.imageUrl}
                alt={image.altText}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">
                    {image.caption || image.altText || "Untitled image"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {categoryName(image.category)} · Order {image.sortOrder}
                  </p>
                </div>
                <Badge
                  variant={
                    image.visibility === "published" ? "default" : "outline"
                  }
                  className="capitalize"
                >
                  {image.visibility}
                </Badge>
              </div>
              <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                {image.description || "No description"}
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingImage(image)}
                >
                  <Pencil />
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label="Delete gallery image"
                  disabled={deletingId === image.id}
                  onClick={() => void handleDelete(image)}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <EditGalleryImagePanel
        image={editingImage}
        open={editingImage !== null}
        onOpenChange={(open) => !open && setEditingImage(null)}
      />
    </>
  )
}
