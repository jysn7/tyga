"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import {
  useUpsertGalleryImage,
  type GalleryImage,
} from "@/hooks/admin/marketing/use-gallery"
import {
  GALLERY_CATEGORIES,
  GALLERY_VISIBILITIES,
} from "@/lib/validations/marketing/gallery-image"

const inputClass =
  "h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"

const CATEGORY_LABELS: Record<string, string> = {
  on_course: "On Course",
  coaching: "Coaching",
  tournaments: "Tournaments",
  academy_life: "Academy Life",
}

export function GalleryImagePanel({
  open,
  onOpenChange,
  image,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: GalleryImage | null
}) {
  if (!open) return null

  return (
    <GalleryImagePanelForm
      key={image?.id ?? "new"}
      open={open}
      onOpenChange={onOpenChange}
      image={image}
    />
  )
}

function GalleryImagePanelForm({
  open,
  onOpenChange,
  image,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: GalleryImage | null
}) {
  const upsert = useUpsertGalleryImage()

  const initialValues = image
    ? {
        imageUrl: image.image_url,
        altText: image.alt_text ?? "",
        category: image.category,
        caption: image.caption ?? "",
        sortOrder: image.sort_order.toString(),
        visibility: image.visibility,
      }
    : {
        imageUrl: "",
        altText: "",
        category: "on_course",
        caption: "",
        sortOrder: "0",
        visibility: "draft",
      }

  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl)
  const [altText, setAltText] = useState(initialValues.altText)
  const [category, setCategory] = useState<string>(initialValues.category)
  const [caption, setCaption] = useState(initialValues.caption)
  const [sortOrder, setSortOrder] = useState(initialValues.sortOrder)
  const [visibility, setVisibility] = useState(initialValues.visibility)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)

    try {
      await upsert.mutateAsync({
        id: image?.id,
        input: {
          imageUrl,
          altText,
          category: category as never,
          caption,
          sortOrder: Number(sortOrder) || 0,
          visibility: visibility as never,
        },
      })

      toast.add({
        title: image ? "Image updated" : "Image added",
        type: "success",
        timeout: 4000,
      })
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      setError(message)
      toast.add({
        title: "Failed to save image",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  const altTextRequired =
    visibility === "published" && altText.trim().length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-xl">
        <DialogHeader className="p-0 pb-6 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {image ? "Edit image" : "Add image"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          {/* Preview */}
          {imageUrl && (
            <div className="flex justify-center">
              <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-border/60 bg-input">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={altText || "Gallery preview"}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Image URL</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            <p className="text-[11px] text-muted-foreground">
              Upload images from the gallery page. This field is for re-linking
              an existing upload.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">
              Alt text{" "}
              {visibility === "published" && (
                <span className="text-destructive">*</span>
              )}
            </label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for screen readers"
              className={inputClass}
            />
            {altTextRequired && (
              <p className="text-[11px] text-destructive">
                Alt text is required before publishing
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Category</label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v ?? "on_course")}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GALLERY_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c] ?? c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">
              Caption (optional)
            </label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Short caption shown under the image"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                Sort order
              </label>
              <Input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                Visibility
              </label>
              <Select
                value={visibility}
                onValueChange={(v) => setVisibility(v ?? "draft")}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GALLERY_VISIBILITIES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={upsert.isPending || altTextRequired}
            className="text-xs"
          >
            {upsert.isPending
              ? "Saving..."
              : image
                ? "Save changes"
                : "Add image"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
