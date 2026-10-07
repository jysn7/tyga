"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export const GALLERY_QUERY_KEY = ["gallery"] as const

export const GALLERY_CATEGORIES = [
  { value: "on_course", label: "On course" },
  { value: "coaching", label: "Coaching" },
  { value: "tournaments", label: "Tournaments" },
  { value: "academy_life", label: "Academy life" },
] as const

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]["value"]
export type GalleryVisibility = "draft" | "published" | "archived"

export type GalleryImage = {
  id: number
  imageUrl: string
  altText: string
  category: GalleryCategory
  caption: string | null
  description: string
  sortOrder: number
  visibility: GalleryVisibility
  publishedAt: string | null
  createdAt: string
}

type GalleryRow = {
  id: number
  image_url: string
  alt_text: string
  category: GalleryCategory
  caption: string | null
  description: string | null
  sort_order: number
  visibility: GalleryVisibility
  published_at: string | null
  created_at: string
}

function mapGalleryImage(row: GalleryRow): GalleryImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    altText: row.alt_text,
    category: row.category,
    caption: row.caption,
    description: row.description ?? "",
    sortOrder: row.sort_order,
    visibility: row.visibility,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }
}

export function useGalleryImages() {
  const supabase = createClient()

  return useQuery({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_gallery_images")
      if (error) throw error
      return ((data ?? []) as GalleryRow[]).map(mapGalleryImage)
    },
  })
}

export type PublishedGalleryImage = Pick<
  GalleryImage,
  | "id"
  | "imageUrl"
  | "altText"
  | "category"
  | "caption"
  | "description"
  | "sortOrder"
>

export function usePublishedGallery(category?: GalleryCategory) {
  const supabase = createClient()

  return useQuery({
    queryKey: [...GALLERY_QUERY_KEY, "published", category ?? "all"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_published_gallery", {
        p_category: category ?? null,
      })
      if (error) throw error
      return (
        (data ?? []) as Array<
          Omit<GalleryRow, "visibility" | "published_at" | "created_at">
        >
      ).map((row) => ({
        id: row.id,
        imageUrl: row.image_url,
        altText: row.alt_text,
        category: row.category,
        caption: row.caption,
        description: row.description ?? "",
        sortOrder: row.sort_order,
      }))
    },
  })
}
