"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GalleryImageUpload } from "@/components/portals/admin/gallery/gallery-image-upload"
import { toast } from "@/components/ui/toast"
import {
  GALLERY_CATEGORIES,
  type GalleryCategory,
  type GalleryImage,
  type GalleryVisibility,
} from "@/hooks/admin/gallery/use-gallery"
import {
  removeStoredGalleryImage,
  useSaveGalleryImage,
} from "@/hooks/admin/gallery/use-gallery-mutations"

const VISIBILITIES: { value: GalleryVisibility; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
]

export function GalleryImageForm({
  image,
  onSaved,
}: {
  image: GalleryImage | null
  onSaved: () => void
}) {
  const [imageUrl, setImageUrl] = useState(image?.imageUrl ?? "")
  const [altText, setAltText] = useState(image?.altText ?? "")
  const [category, setCategory] = useState<GalleryCategory>(
    image?.category ?? "on_course"
  )
  const [caption, setCaption] = useState(image?.caption ?? "")
  const [description, setDescription] = useState(image?.description ?? "")
  const [sortOrder, setSortOrder] = useState(image?.sortOrder.toString() ?? "0")
  const [visibility, setVisibility] = useState<GalleryVisibility>(
    image?.visibility ?? "draft"
  )
  const [uploading, setUploading] = useState(false)
  const saveImage = useSaveGalleryImage()

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await saveImage.mutateAsync({
        id: image?.id,
        imageUrl,
        altText: altText.trim(),
        category,
        caption: caption.trim(),
        description: description.trim(),
        sortOrder: Number(sortOrder),
        visibility,
      })
      let oldImageCleanupFailed = false
      if (image?.imageUrl && image.imageUrl !== imageUrl) {
        try {
          await removeStoredGalleryImage(image.imageUrl)
        } catch (error) {
          console.error(
            "Gallery image updated but old file cleanup failed:",
            error
          )
          oldImageCleanupFailed = true
        }
      }
      toast.add(
        oldImageCleanupFailed
          ? {
              title: "Gallery image saved",
              description:
                "The previous image could not be removed from storage. Please clean it up from Supabase Storage.",
              type: "error",
              timeout: 7000,
            }
          : {
              title: image ? "Gallery image updated" : "Gallery image added",
              type: "success",
              timeout: 4000,
            }
      )
      onSaved()
    } catch (error) {
      let cleanupMessage = ""
      if (imageUrl && imageUrl !== image?.imageUrl) {
        try {
          await removeStoredGalleryImage(imageUrl)
          setImageUrl(image?.imageUrl ?? "")
        } catch (cleanupError) {
          console.error(
            "Unreferenced gallery image cleanup failed:",
            cleanupError
          )
          cleanupMessage =
            " The uploaded image could not be cleaned up from storage."
        }
      }
      toast.add({
        title: image ? "Failed to update image" : "Failed to add image",
        description:
          (error instanceof Error ? error.message : "Something went wrong.") +
          cleanupMessage,
        type: "error",
        timeout: 5000,
      })
    }
  }

  const isSaving = saveImage.isPending

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="gallery-image">
          Image
        </label>
        <GalleryImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          onUploadingChange={setUploading}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="gallery-alt-text">
          Alt text{" "}
          {visibility === "published" && <span aria-hidden="true">*</span>}
        </label>
        <Input
          id="gallery-alt-text"
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          maxLength={250}
          placeholder="Describe the image for accessibility"
          required={visibility === "published"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={category}
            onValueChange={(value) =>
              value && setCategory(value as GalleryCategory)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GALLERY_CATEGORIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Visibility</label>
          <Select
            value={visibility}
            onValueChange={(value) =>
              value && setVisibility(value as GalleryVisibility)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="gallery-caption">
          Caption <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="gallery-caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={250}
          placeholder="Short title shown with the photo"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="gallery-description">
          Description
        </label>
        <Textarea
          id="gallery-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          placeholder="Add more context about this photo"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="gallery-sort-order">
          Display order
        </label>
        <Input
          id="gallery-sort-order"
          type="number"
          min="0"
          step="1"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={
          isSaving ||
          uploading ||
          !imageUrl ||
          !Number.isInteger(Number(sortOrder)) ||
          Number(sortOrder) < 0
        }
      >
        {isSaving ? "Saving..." : image ? "Save changes" : "Add to gallery"}
      </Button>
    </form>
  )
}
