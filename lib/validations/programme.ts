import { z } from "zod"

export const PROGRAMME_TYPES = [
  "development",
  "weekly_community",
  "holiday_camp",
  "clinic",
  "corporate",
  "league",
] as const

export const GENDER_RESTRICTIONS = ["any", "male", "female"] as const

export type ProgrammeType = (typeof PROGRAMME_TYPES)[number]
export type GenderRestriction = (typeof GENDER_RESTRICTIONS)[number]

export const programmeFormSchema = z
  .object({
    // -------- Basic --------
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(120, "Name must be under 120 characters"),

    type: z.enum(PROGRAMME_TYPES, {
      required_error: "Type is required",
      invalid_type_error: "Please select a valid type",
    }),

    levelId: z
      .number({ invalid_type_error: "Level must be a number" })
      .int()
      .positive()
      .nullable()
      .optional(),

    venueId: z
      .number({ required_error: "Venue is required" })
      .int()
      .positive("Please select a venue"),

    minAge: z
      .number({ required_error: "Min age is required" })
      .int()
      .min(3, "Min age must be at least 3")
      .max(100, "Min age must be 100 or less"),

    maxAge: z
      .number({ required_error: "Max age is required" })
      .int()
      .min(3, "Max age must be at least 3")
      .max(100, "Max age must be 100 or less"),

    genderRestriction: z.enum(GENDER_RESTRICTIONS, {
      required_error: "Gender restriction is required",
    }),

    description: z
      .string()
      .max(1000, "Description must be under 1000 characters")
      .trim()
      .optional()
      .or(z.literal("")),

    imageUrl: z.string().url("Invalid image URL").nullable().optional(),

    // -------- Details --------
    recurrenceRule: z
      .string()
      .max(200, "Recurrence must be under 200 characters")
      .trim()
      .optional()
      .or(z.literal("")),

    termStart: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
      .optional()
      .or(z.literal("")),

    termEnd: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
      .optional()
      .or(z.literal("")),

    price: z
      .number({ invalid_type_error: "Price must be a number" })
      .min(0, "Price must be 0 or more")
      .max(1_000_000, "Price looks too high")
      .optional(),

    capacity: z
      .number({ invalid_type_error: "Capacity must be a number" })
      .int()
      .min(1, "Capacity must be at least 1")
      .max(10_000, "Capacity looks too high")
      .optional(),

    maxRatio: z
      .number({ invalid_type_error: "Ratio must be a number" })
      .int()
      .min(1, "Ratio must be at least 1")
      .max(100, "Ratio looks too high")
      .nullable()
      .optional(),
  })
  .refine((data) => data.maxAge >= data.minAge, {
    path: ["maxAge"],
    message: "Max age must be ≥ min age",
  })
  .refine(
    (data) => {
      if (!data.termStart || !data.termEnd) return true
      return data.termEnd >= data.termStart
    },
    {
      path: ["termEnd"],
      message: "Term end must be on or after term start",
    }
  )

export type ProgrammeFormValues = z.infer<typeof programmeFormSchema>

// -------- Helpers for parsing form state --------

export function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

export function parseNullableNumber(value: string): number | null {
  if (value.trim() === "") return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

export function parseNullableString(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}
