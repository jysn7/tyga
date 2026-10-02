"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Field, fieldStyles } from "@/components/portals/shared/field"
import {
  useUpdateAppSettings,
  type AppSettings,
  type AppSettingsRow,
} from "@/hooks/lookups/use-academy-settings"
import { SaveBar } from "./save-bar"

export function AcademyTab({ settings }: { settings: AppSettings }) {
  const router = useRouter()
  const update = useUpdateAppSettings()
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const [bookingLeadHours, setBookingLeadHours] = useState(
    settings.bookingLeadHours.toString()
  )
  const [bookingLookaheadDays, setBookingLookaheadDays] = useState(
    settings.bookingLookaheadDays.toString()
  )
  const [defaultSlotMinutes, setDefaultSlotMinutes] = useState(
    settings.defaultSlotMinutes.toString()
  )
  const [cancellationCutoffHours, setCancellationCutoffHours] = useState(
    settings.cancellationCutoffHours.toString()
  )
  const [defaultMaxRatio, setDefaultMaxRatio] = useState(
    settings.defaultMaxRatio.toString()
  )
  const [timezone, setTimezone] = useState(settings.timezone)

  function handleSave() {
    const patch: Partial<AppSettingsRow> = {
      booking_lead_hours: Number(bookingLeadHours),
      booking_lookahead_days: Number(bookingLookaheadDays),
      default_slot_minutes: Number(defaultSlotMinutes),
      cancellation_cutoff_hours: Number(cancellationCutoffHours),
      default_max_ratio: Number(defaultMaxRatio),
      timezone,
    }

    update.mutate(patch, {
      onSuccess: () => {
        toast.add({
          title: "Academy settings saved",
          type: "success",
          timeout: 4000,
        })
        setSavedAt(Date.now())
        router.refresh()
      },
      onError: (err) =>
        toast.add({
          title: "Save failed",
          description:
            err instanceof Error ? err.message : "Something went wrong",
          type: "error",
          timeout: 5000,
        }),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Bookings
          </h2>
          <p className="text-xs text-muted-foreground">
            Rules that control how parents book appointments
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field
            label="Booking lead time (hours)"
            hint="Minimum notice a parent needs before booking a slot"
          >
            <Input
              className={fieldStyles}
              type="number"
              min="0"
              value={bookingLeadHours}
              onChange={(e) => setBookingLeadHours(e.target.value)}
            />
          </Field>

          <Field
            label="Booking lookahead (days)"
            hint="How far into the future parents can see available slots"
          >
            <Input
              className={fieldStyles}
              type="number"
              min="1"
              value={bookingLookaheadDays}
              onChange={(e) => setBookingLookaheadDays(e.target.value)}
            />
          </Field>

          <Field
            label="Cancellation cutoff (hours)"
            hint="Parents cannot cancel inside this window — they must contact the academy"
          >
            <Input
              className={fieldStyles}
              type="number"
              min="0"
              value={cancellationCutoffHours}
              onChange={(e) => setCancellationCutoffHours(e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Slots and ratios
          </h2>
          <p className="text-xs text-muted-foreground">
            Defaults used when a coach or programme doesn&apos;t specify
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field
            label="Default slot length (minutes)"
            hint="Used when a coach opens a slot without a duration"
          >
            <Input
              className={fieldStyles}
              type="number"
              min="5"
              step="5"
              value={defaultSlotMinutes}
              onChange={(e) => setDefaultSlotMinutes(e.target.value)}
            />
          </Field>

          <Field
            label="Default max ratio"
            hint="Fallback coach-to-student ratio when a programme doesn't set one"
          >
            <Input
              className={fieldStyles}
              type="number"
              min="1"
              value={defaultMaxRatio}
              onChange={(e) => setDefaultMaxRatio(e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Localisation
          </h2>
          <p className="text-xs text-muted-foreground">
            How dates and times are rendered across the app
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field
            label="Academy timezone"
            hint="All times are stored in UTC and displayed in this timezone"
          >
            <Input
              className={fieldStyles}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Africa/Johannesburg"
            />
          </Field>
        </div>
      </section>

      <SaveBar
        onSave={handleSave}
        isSaving={update.isPending}
        savedAt={savedAt}
      />
    </div>
  )
}
