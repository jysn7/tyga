import { z } from "zod"

export const MARKETING_VISIBILITIES = [
  "draft",
  "published",
  "archived",
] as const

export type MarketingVisibility = (typeof MARKETING_VISIBILITIES)[number]

export const marketingProgrammeSchema = z.object({
  programmeId: z
    .number({ invalid_type_error: "Programme must be a number" })
    .int()
    .positive()
    .nullable()
    .optional(),

  displayTitle: z
    .string({ required_error: "Display title is required" })
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(80, "Title must be under 80 characters"),

  eyebrow: z
    .string()
    .max(40, "Eyebrow must be under 40 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  summary: z
    .string()
    .max(200, "Summary must be under 200 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .max(2000, "Description must be under 2000 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  bullets: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Bullet cannot be empty")
        .max(120, "Bullet must be under 120 characters")
    )
    .max(8, "Maximum 8 bullets")
    .default([]),

  imageUrl: z.string().url("Invalid image URL").nullable().optional(),

  ctaLabel: z
    .string()
    .trim()
    .min(1, "CTA label is required")
    .max(40, "CTA label must be under 40 characters")
    .default("Enrol"),

  ctaUrl: z
    .string()
    .trim()
    .max(500, "URL must be under 500 characters")
    .optional()
    .or(z.literal("")),

  priceOverride: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative")
    .max(1_000_000, "Price looks too high")
    .nullable()
    .optional(),

  sortOrder: z.number().int().min(0).max(9999).default(0),

  visibility: z.enum(MARKETING_VISIBILITIES, {
    required_error: "Visibility is required",
  }),
})

export type MarketingProgrammeInput = z.infer<typeof marketingProgrammeSchema>
