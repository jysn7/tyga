import { z } from "zod"

export const siteContentSchema = z.object({
  heroEyebrow: z
    .string()
    .max(60, "Eyebrow must be under 60 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  heroHeading: z
    .string()
    .max(120, "Heading must be under 120 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  heroSummary: z
    .string()
    .max(300, "Summary must be under 300 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  heroCtaLabel: z
    .string()
    .max(40, "CTA label must be under 40 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  heroCtaUrl: z
    .string()
    .max(500, "URL must be under 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  homepageIntro: z
    .string()
    .max(2000, "Intro must be under 2000 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  marketingStatements: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Statement cannot be empty")
        .max(120, "Statement must be under 120 characters")
    )
    .max(6, "Maximum 6 statements")
    .default([]),

  location: z
    .string()
    .max(120, "Location must be under 120 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  parentPortalUrl: z
    .string()
    .max(500, "URL must be under 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  socialLinks: z
    .object({
      facebook: z.string().url("Invalid URL").or(z.literal("")).optional(),
      instagram: z.string().url("Invalid URL").or(z.literal("")).optional(),
      tiktok: z.string().url("Invalid URL").or(z.literal("")).optional(),
      x: z.string().url("Invalid URL").or(z.literal("")).optional(),
      youtube: z.string().url("Invalid URL").or(z.literal("")).optional(),
    })
    .default({}),

  seoTitle: z
    .string()
    .max(70, "SEO title must be under 70 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  seoDescription: z
    .string()
    .max(160, "SEO description must be under 160 characters")
    .trim()
    .optional()
    .or(z.literal("")),
})

export type SiteContentInput = z.infer<typeof siteContentSchema>
