// lib/validations/appointment-slots.ts
import { z } from "zod"

/** Grace window for same-day slots, in minutes. */
export const SLOT_GRACE_MINUTES = 2

/** Local-time today as YYYY-MM-DD. Never use toISOString() — it's UTC. */
export function todayIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

/** Local-time now as HH:mm. */
export function nowHm(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function toLocalDateTime(date: string, time: string): Date | null {
  if (!date || !time) return null
  const dt = new Date(`${date}T${time}:00`)
  return Number.isNaN(dt.getTime()) ? null : dt
}

export function earliestAllowed(): Date {
  return new Date(Date.now() - SLOT_GRACE_MINUTES * 60 * 1000)
}

export function isPastGrace(date: string, time: string): boolean {
  const dt = toLocalDateTime(date, time)
  if (!dt) return false
  return dt < earliestAllowed()
}

export const openSlotSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date is required"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time is required"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time is required"),
    venueId: z.string().min(1, "Venue is required"),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  })
  .superRefine((data, ctx) => {
    if (data.date < todayIso()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Date cannot be in the past",
      })
    }

    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after start time",
      })
    }

    if (data.date === todayIso() && isPastGrace(data.date, data.startTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: `Start time must be at least ${SLOT_GRACE_MINUTES} minutes from now`,
      })
    }
  })

export type OpenSlotInput = z.infer<typeof openSlotSchema>

// lib/validations/appointment-slots.ts (append)

export const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const
export const SLOT_MINUTES = [30, 45, 60, 90] as const

export const addRuleSchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time is required"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time is required"),
    slotMinutes: z.coerce
      .number()
      .int()
      .min(15, "Slot length must be at least 15 minutes"),
    venueId: z.string().min(1, "Venue is required"),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
    validFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required"),
    validUntil: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date")
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // 1. End after start
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after start time",
      })
    }

    // 2. Slot length must fit at least once in the window
    const [sh, sm] = data.startTime.split(":").map(Number)
    const [eh, em] = data.endTime.split(":").map(Number)
    const windowMinutes = eh * 60 + em - (sh * 60 + sm)
    if (windowMinutes > 0 && windowMinutes < data.slotMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["slotMinutes"],
        message: `Window is only ${windowMinutes} minutes — needs to be at least ${data.slotMinutes}`,
      })
    }

    // 3. Valid-from cannot be in the past
    if (data.validFrom < todayIso()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validFrom"],
        message: "Valid-from date cannot be in the past",
      })
    }

    // 4. Valid-until must be on or after valid-from
    if (data.validUntil && data.validUntil < data.validFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validUntil"],
        message: "Valid-until must be on or after valid-from",
      })
    }
  })

export type AddRuleInput = z.infer<typeof addRuleSchema>
