"use client"

import { SidePanel } from "@/components/portals/shared/side-sheet"
import { GalleryImageForm } from "./gallery-image-form"
import type { GalleryImage } from "@/hooks/admin/gallery/use-gallery"

export function EditGalleryImagePanel({
  image,
  open,
  onOpenChange,
}: {
  image: GalleryImage | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Edit gallery image"
      description="Update image details, description, and publishing status."
    >
      {image && (
        <GalleryImageForm
          key={image.id}
          image={image}
          onSaved={() => onOpenChange(false)}
        />
      )}
    </SidePanel>
  )
}
