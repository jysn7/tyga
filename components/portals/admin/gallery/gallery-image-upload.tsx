"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUploadGalleryImage } from "@/hooks/admin/gallery/use-gallery-mutations"

export function GalleryImageUpload({
  value,
  onChange,
  onUploadingChange,
}: {
  value: string
  onChange: (url: string) => void
  onUploadingChange: (uploading: boolean) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(value)
  const [errorMessage, setErrorMessage] = useState("")
  const upload = useUploadGalleryImage()

  async function handleFile(file: File) {
    setErrorMessage("")
    onUploadingChange(true)
    try {
      const publicUrl = await upload.mutateAsync(file)
      setPreview(publicUrl)
      onChange(publicUrl)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Image upload failed."
      )
    } finally {
      onUploadingChange(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border/60 bg-muted">
          <Image
            src={preview}
            alt="Gallery image preview"
            fill
            unoptimized
            className="object-cover"
          />
          <div className="absolute right-2 bottom-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={upload.isPending}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              aria-label="Remove selected image"
              disabled={upload.isPending}
              onClick={() => {
                setPreview("")
                onChange("")
              }}
            >
              <X />
            </Button>
          </div>
          {upload.isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 text-muted-foreground transition-colors hover:bg-muted/30 disabled:opacity-50"
        >
          {upload.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          <span className="text-sm">
            {upload.isPending ? "Uploading..." : "Choose a gallery image"}
          </span>
          <span className="text-xs">
            JPEG, PNG, WebP, GIF, or AVIF · max 4 MB
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
