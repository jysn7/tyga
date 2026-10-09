import { z } from "zod"

export const EVENT_VISIBILITIES = ["draft", "published", "archived"] as const
export const EVENT_TYPES = [
  "clinic",
  "camp",
  "tournament",
  "showcase",
  "social",
  "other",
] as const

export type EventVisibility = (typeof EVENT_VISIBILITIES)[number]
export type EventType = (typeof EVENT_TYPES)[number]

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const TIME_REGEX = /^\d{2}:\d{2}$/

export const eventSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(120, "Name must be under 120 characters"),

    type: z.enum(EVENT_TYPES, {
      required_error: "Type is required",
      invalid_type_error: "Select a valid type",
    }),

    venueId: z
      .number({ required_error: "Venue is required" })
      .int()
      .positive("Select a venue"),

    eventDate: z
      .string({ required_error: "Date is required" })
      .regex(DATE_REGEX, "Invalid date"),

    startTime: z
      .string()
      .regex(TIME_REGEX, "Invalid time")
      .optional()
      .or(z.literal("")),

    description: z
      .string()
      .max(2000, "Description must be under 2000 characters")
      .trim()
      .optional()
      .or(z.literal("")),

    imageUrl: z.string().url("Invalid image URL").nullable().optional(),

    entryFee: z
      .number({ invalid_type_error: "Fee must be a number" })
      .min(0, "Fee cannot be negative")
      .max(100_000, "Fee looks too high")
      .optional(),

    capacity: z
      .number({ invalid_type_error: "Capacity must be a number" })
      .int()
      .min(1, "Capacity must be at least 1")
      .max(10_000, "Capacity looks too high")
      .optional(),

    sortOrder: z.number().int().min(0).max(9999).default(0),

    visibility: z.enum(EVENT_VISIBILITIES, {
      required_error: "Visibility is required",
    }),
  })
  .refine(
    (data) => {
      if (data.capacity == null) return true
      return data.capacity > 0
    },
    { path: ["capacity"], message: "Capacity must be greater than 0" }
  )

export type EventInput = z.infer<typeof eventSchema>
