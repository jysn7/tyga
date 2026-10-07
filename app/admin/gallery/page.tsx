"use client"

import { useState } from "react"
import { ImagePlus } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { Button } from "@/components/ui/button"
import { CreateGalleryImageModal } from "@/components/portals/admin/gallery/create-gallery-image-modal"
import { GalleryImageList } from "@/components/portals/admin/gallery/gallery-image-list"
import { useGalleryImages } from "@/hooks/admin/gallery/use-gallery"

export default function AdminGalleryPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: images, isLoading, isError, error } = useGalleryImages()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gallery"
        description="Manage the images and descriptions shown in the public gallery."
        action={
          <Button
            size="lg"
            variant="secondary"
            className="gap-1.5 rounded-lg text-xs"
            onClick={() => setCreateOpen(true)}
          >
            <ImagePlus className="h-4 w-4" />
            Add image
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          Unable to load gallery images:{" "}
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
        </div>
      ) : (
        <GalleryImageList images={images ?? []} />
      )}

      <CreateGalleryImageModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
