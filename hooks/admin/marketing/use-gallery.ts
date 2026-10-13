"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import {
  galleryImageSchema,
  GALLERY_IMAGE_MAX_BYTES,
  GALLERY_IMAGE_ACCEPTED_TYPES,
  type GalleryImageInput,
  type GalleryCategory,
} from "@/lib/validations/marketing/gallery-image"

export type GalleryImage = {
  id: number
  image_url: string
  alt_text: string
  category: GalleryCategory
  caption: string | null
  sort_order: number
  visibility: "draft" | "published" | "archived"
  published_at: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

const KEY = "marketing-gallery"

export function useGalleryImages() {
  const supabase = createClient()
  return useQuery({
    queryKey: [KEY],
    queryFn: async (): Promise<GalleryImage[]> => {
      const { data, error } = await supabase.rpc("admin_get_gallery_images")
      if (error) throw new Error(error.message)
      return (data ?? []) as GalleryImage[]
    },
  })
}

export function useUploadGalleryImage() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (file: File): Promise<{ url: string; path: string }> => {
      if (file.size > GALLERY_IMAGE_MAX_BYTES) {
        throw new Error("Image must be under 5 MB")
      }
      if (
        !GALLERY_IMAGE_ACCEPTED_TYPES.includes(
          file.type as (typeof GALLERY_IMAGE_ACCEPTED_TYPES)[number]
        )
      ) {
        throw new Error("Only JPG, PNG, WebP, or AVIF allowed")
      }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
      const path = `${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from("gallery-images")
        .upload(path, file, { upsert: false, cacheControl: "3600" })

      if (error) throw new Error(error.message)

      const { data } = supabase.storage
        .from("gallery-images")
        .getPublicUrl(path)

      return { url: data.publicUrl, path }
    },
  })
}

export function useUpsertGalleryImage() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id?: number
      input: GalleryImageInput
    }) => {
      const parsed = galleryImageSchema.safeParse(input)
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid input")
      }
      const v = parsed.data

      const { data, error } = await supabase.rpc("admin_upsert_gallery_image", {
        p_id: id ?? null,
        p_image_url: v.imageUrl,
        p_alt_text: v.altText,
        p_category: v.category,
        p_caption: v.caption || null,
        p_sort_order: v.sortOrder,
        p_visibility: v.visibility,
      })
      if (error) throw new Error(error.message)
      return data as number
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}

export function useDeleteGalleryImage() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc("admin_delete_gallery_image", {
        p_id: id,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}
