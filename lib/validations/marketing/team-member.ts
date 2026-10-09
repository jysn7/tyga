import { z } from "zod"

export const TEAM_VISIBILITIES = ["draft", "published", "archived"] as const

export type TeamVisibility = (typeof TEAM_VISIBILITIES)[number]

export const teamMemberSchema = z.object({
  displayName: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be under 80 characters"),

  roleTitle: z
    .string({ required_error: "Role is required" })
    .trim()
    .min(2, "Role must be at least 2 characters")
    .max(60, "Role must be under 60 characters"),

  bio: z
    .string()
    .max(600, "Bio must be under 600 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  portraitUrl: z.string().url("Invalid image URL").nullable().optional(),

  coachId: z
    .number({ invalid_type_error: "Coach must be a number" })
    .int()
    .positive()
    .nullable()
    .optional(),

  sortOrder: z.number().int().min(0).max(9999).default(0),

  visibility: z.enum(TEAM_VISIBILITIES, {
    required_error: "Visibility is required",
  }),
})

export type TeamMemberInput = z.infer<typeof teamMemberSchema>
