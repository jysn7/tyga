"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { useUploadEventImage } from "@/hooks/admin/events/use-event-image-upload"

export function EventImageUpload({
  value,
  onChange,
}: {
  value: string | null
  onChange: (url: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadEventImage()
  const [preview, setPreview] = useState<string | null>(value)

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file))
    const url = await upload.mutateAsync(file)
    onChange(url)
  }

  if (preview) {
    return (
      <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border/60">
        <Image
          src={preview}
          alt="Event header"
          fill
          unoptimized
          className="object-cover"
        />
        {upload.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <button
          onClick={() => {
            setPreview(null)
            onChange(null)
          }}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => inputRef.current?.click()}
      disabled={upload.isPending}
      className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 text-muted-foreground transition-colors hover:bg-muted/30 disabled:opacity-50"
    >
      {upload.isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <ImagePlus className="h-5 w-5" />
      )}
      <span className="text-sm">
        {upload.isPending ? "Uploading..." : "Upload a header image"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </button>
  )
}
