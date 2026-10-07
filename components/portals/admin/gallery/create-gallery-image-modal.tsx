"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GalleryImageForm } from "./gallery-image-form"

export function CreateGalleryImageModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add gallery image</DialogTitle>
          <DialogDescription>
            Upload an image up to 4 MB, then add its description and display
            details.
          </DialogDescription>
        </DialogHeader>
        <GalleryImageForm
          key={open ? "new-gallery-image" : "closed-gallery-image"}
          image={null}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
