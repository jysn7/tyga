// lib/validations/session.ts
import { z } from "zod"

export const SESSION_STATUSES = ["scheduled", "cancelled", "completed"] as const
export const SESSION_ROLES = ["lead", "assistant", "volunteer"] as const

export type SessionStatus = (typeof SESSION_STATUSES)[number]
export type SessionRole = (typeof SESSION_ROLES)[number]

const TIME_REGEX = /^\d{2}:\d{2}$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

// -------- Generate sessions --------

export const generateSessionsSchema = z
  .object({
    programmeId: z
      .number({ required_error: "Programme is required" })
      .int()
      .positive(),

    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .min(1, "Select at least one day")
      .refine((days) => new Set(days).size === days.length, {
        message: "Duplicate days are not allowed",
      }),

    startTime: z
      .string({ required_error: "Start time is required" })
      .regex(TIME_REGEX, "Invalid start time"),

    endTime: z
      .string({ required_error: "End time is required" })
      .regex(TIME_REGEX, "Invalid end time"),

    rangeStart: z
      .string({ required_error: "Range start is required" })
      .regex(DATE_REGEX, "Invalid range start date")
      .refine((d) => d >= todayIso(), {
        message: "Range start cannot be in the past",
      }),

    rangeEnd: z
      .string({ required_error: "Range end is required" })
      .regex(DATE_REGEX, "Invalid range end date"),
  })
  .refine((data) => data.endTime > data.startTime, {
    path: ["endTime"],
    message: "End time must be after start time",
  })
  .refine((data) => data.rangeEnd >= data.rangeStart, {
    path: ["rangeEnd"],
    message: "Range end must be on or after range start",
  })

export type GenerateSessionsInput = z.infer<typeof generateSessionsSchema>

// -------- Edit a single session --------

export const editSessionSchema = z
  .object({
    sessionDate: z
      .string()
      .regex(DATE_REGEX, "Invalid date")
      .optional()
      .or(z.literal("")),

    startTime: z
      .string()
      .regex(TIME_REGEX, "Invalid start time")
      .optional()
      .or(z.literal("")),

    endTime: z
      .string()
      .regex(TIME_REGEX, "Invalid end time")
      .optional()
      .or(z.literal("")),

    status: z
      .enum(SESSION_STATUSES, {
        invalid_type_error: "Please select a valid status",
      })
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true
      return data.endTime > data.startTime
    },
    {
      path: ["endTime"],
      message: "End time must be after start time",
    }
  )

export type EditSessionInput = z.infer<typeof editSessionSchema>

// -------- Assign a coach to a session --------

export const assignCoachSchema = z.object({
  sessionId: z.number().int().positive(),
  coachId: z
    .number({ required_error: "Please select a coach" })
    .int()
    .positive(),
  role: z.enum(SESSION_ROLES, {
    required_error: "Please select a role",
  }),
})

export type AssignCoachInput = z.infer<typeof assignCoachSchema>
