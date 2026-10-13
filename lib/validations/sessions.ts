// lib/validations/session.ts
import { z } from "zod"

export const SESSION_STATUSES = ["scheduled", "cancelled", "completed"] as const
export const SESSION_ROLES = ["lead", "assistant", "volunteer"] as const

export type SessionStatus = (typeof SESSION_STATUSES)[number]
export type SessionRole = (typeof SESSION_ROLES)[number]

const TIME_REGEX = /^\d{2}:\d{2}$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * Grace window (in minutes). A session starting within this many minutes in
 * the past is still accepted, to account for slow forms and clock skew.
 */
export const SESSION_GRACE_MINUTES = 2

/** Local-time "today" as YYYY-MM-DD. Never use toISOString() — it's UTC. */
export function todayIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

/** Local-time "now" as HH:mm. */
export function nowHm(): string {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}

/**
 * Combine a YYYY-MM-DD date and HH:mm time into a local Date.
 * Returns null on malformed input.
 */
export function toLocalDateTime(date: string, time: string): Date | null {
  if (!date || !time) return null
  if (!DATE_REGEX.test(date) || !TIME_REGEX.test(time)) return null
  const dt = new Date(`${date}T${time}:00`)
  return Number.isNaN(dt.getTime()) ? null : dt
}

/**
 * The earliest datetime a session may start: now minus the grace window.
 * Exposed so the UI can compute `min` values and disable buttons live.
 */
export function earliestAllowed(): Date {
  return new Date(Date.now() - SESSION_GRACE_MINUTES * 60 * 1000)
}

/**
 * Returns true when the given date+time is in the past beyond the grace
 * window. Used by both the schemas and the UI for live feedback.
 */
export function isPastGrace(date: string, time: string): boolean {
  const dt = toLocalDateTime(date, time)
  if (!dt) return false
  return dt < earliestAllowed()
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
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after start time",
      })
    }

    if (data.rangeEnd < data.rangeStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rangeEnd"],
        message: "Range end must be on or after range start",
      })
    }

    // If the range starts today, the first session must respect the grace
    // window. Future ranges are unconstrained on time.
    if (
      data.rangeStart === todayIso() &&
      isPastGrace(data.rangeStart, data.startTime)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: `Start time must be at least ${SESSION_GRACE_MINUTES} minutes from now`,
      })
    }
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
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after start time",
      })
    }

    if (data.sessionDate && data.sessionDate < todayIso()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sessionDate"],
        message: "Date cannot be in the past",
      })
    }

    if (
      data.sessionDate === todayIso() &&
      data.startTime &&
      isPastGrace(data.sessionDate, data.startTime)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: `Start time must be at least ${SESSION_GRACE_MINUTES} minutes from now`,
      })
    }
  })

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
