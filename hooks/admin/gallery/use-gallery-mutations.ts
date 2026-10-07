"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import { GALLERY_QUERY_KEY } from "./use-gallery"
import type {
  GalleryCategory,
  GalleryImage,
  GalleryVisibility,
} from "./use-gallery"

export const MAX_GALLERY_IMAGE_BYTES = 4 * 1024 * 1024
export const GALLERY_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const

export function validateGalleryImage(file: File) {
  if (file.size > MAX_GALLERY_IMAGE_BYTES) {
    throw new Error("Choose an image that is 4 MB or smaller.")
  }
  if (
    !GALLERY_IMAGE_MIME_TYPES.includes(
      file.type as (typeof GALLERY_IMAGE_MIME_TYPES)[number]
    )
  ) {
    throw new Error("Use a JPEG, PNG, WebP, GIF, or AVIF image.")
  }
}

function getStoragePath(imageUrl: string) {
  const path = new URL(imageUrl).pathname
  const marker = "/storage/v1/object/public/gallery-images/"
  const markerIndex = path.indexOf(marker)
  if (markerIndex === -1) return null
  return decodeURIComponent(path.slice(markerIndex + marker.length))
}

export async function removeStoredGalleryImage(imageUrl: string) {
  const path = getStoragePath(imageUrl)
  if (!path) return
  const { error } = await createClient()
    .storage.from("gallery-images")
    .remove([path])
  if (error) throw error
}

export function useUploadGalleryImage() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (file: File) => {
      validateGalleryImage(file)
      const extensionByType: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/avif": "avif",
      }
      const path = `${crypto.randomUUID()}.${extensionByType[file.type]}`
      const { error } = await supabase.storage
        .from("gallery-images")
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        })
      if (error) throw error
      const { data } = supabase.storage
        .from("gallery-images")
        .getPublicUrl(path)
      return data.publicUrl
    },
  })
}

export type GalleryImageInput = {
  imageUrl: string
  altText: string
  category: GalleryCategory
  caption: string
  description: string
  sortOrder: number
  visibility: GalleryVisibility
}

type SaveGalleryImageInput = GalleryImageInput & { id?: number }

export function useSaveGalleryImage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: SaveGalleryImageInput) => {
      if (!input.imageUrl.trim()) throw new Error("An image is required.")
      if (input.visibility === "published" && !input.altText.trim()) {
        throw new Error("Alt text is required before publishing.")
      }

      const { data, error } = await supabase.rpc("admin_upsert_gallery_image", {
        p_id: input.id ?? null,
        p_image_url: input.imageUrl,
        p_alt_text: input.altText,
        p_category: input.category,
        p_caption: input.caption || null,
        p_sort_order: input.sortOrder,
        p_visibility: input.visibility,
        p_description: input.description,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY }),
  })
}

export function useDeleteGalleryImage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (image: Pick<GalleryImage, "id" | "imageUrl">) => {
      const { error } = await supabase.rpc("admin_delete_gallery_image", {
        p_id: image.id,
      })
      if (error) throw error

      try {
        await removeStoredGalleryImage(image.imageUrl)
        return { storageCleanupFailed: false }
      } catch (error) {
        console.error("Gallery row deleted but image cleanup failed:", error)
        return { storageCleanupFailed: true }
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY }),
  })
}
