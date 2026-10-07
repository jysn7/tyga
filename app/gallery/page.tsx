"use client"

import Image from "next/image"
import { useState } from "react"
import { Image as ImageIcon } from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Button } from "@/components/ui/button"
import {
  GALLERY_CATEGORIES,
  type GalleryCategory,
  usePublishedGallery,
} from "@/hooks/admin/gallery/use-gallery"

export default function PublicGalleryPage() {
  const [category, setCategory] = useState<GalleryCategory | undefined>()
  const {
    data: images,
    isLoading,
    isError,
    error,
  } = usePublishedGallery(category)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          TYGA Junior Golf
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Gallery
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Moments from coaching, tournaments, and life at the academy.
        </p>
      </header>

      <nav
        aria-label="Filter gallery by category"
        className="flex flex-wrap gap-2"
      >
        <Button
          type="button"
          size="sm"
          variant={category === undefined ? "secondary" : "outline"}
          aria-pressed={category === undefined}
          onClick={() => setCategory(undefined)}
        >
          All
        </Button>
        {GALLERY_CATEGORIES.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="sm"
            variant={category === item.value ? "secondary" : "outline"}
            aria-pressed={category === item.value}
            onClick={() => setCategory(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading gallery...
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          Unable to load the gallery:{" "}
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
        </div>
      ) : images?.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="space-y-1 p-4">
                {image.caption && (
                  <h2 className="font-medium">{image.caption}</h2>
                )}
                {image.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {image.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No published photos yet"
          description="Check back soon for photos from TYGA."
        />
      )}
    </main>
  )
}
