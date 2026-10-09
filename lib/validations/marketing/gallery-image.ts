import { z } from "zod"

export const GALLERY_CATEGORIES = [
  "on_course",
  "coaching",
  "tournaments",
  "academy_life",
] as const

export const GALLERY_VISIBILITIES = ["draft", "published", "archived"] as const

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]
export type GalleryVisibility = (typeof GALLERY_VISIBILITIES)[number]

export const galleryImageSchema = z
  .object({
    imageUrl: z
      .string({ required_error: "Image is required" })
      .url("Invalid image URL"),

    altText: z
      .string()
      .trim()
      .max(200, "Alt text must be under 200 characters"),

    category: z.enum(GALLERY_CATEGORIES, {
      required_error: "Category is required",
    }),

    caption: z
      .string()
      .max(200, "Caption must be under 200 characters")
      .trim()
      .optional()
      .or(z.literal("")),

    sortOrder: z.number().int().min(0).max(9999).default(0),

    visibility: z.enum(GALLERY_VISIBILITIES, {
      required_error: "Visibility is required",
    }),
  })
  .refine(
    (data) => {
      if (data.visibility !== "published") return true
      return data.altText.trim().length > 0
    },
    {
      path: ["altText"],
      message: "Alt text is required before publishing",
    }
  )

export type GalleryImageInput = z.infer<typeof galleryImageSchema>

export const GALLERY_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const GALLERY_IMAGE_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const
