"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { Field, fieldStyles } from "@/components/portals/shared/field"
import {
  useUpdateAppSettings,
  type AppSettings,
} from "@/hooks/lookups/use-academy-settings"
import { SaveBar } from "./save-bar"

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-sm text-foreground">{label}</span>
        {hint && (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function NotificationsTab({ settings }: { settings: AppSettings }) {
  const router = useRouter()
  const update = useUpdateAppSettings()
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const [fromEmail, setFromEmail] = useState(settings.fromEmail ?? "")
  const [fromName, setFromName] = useState(settings.fromName ?? "")
  const [replyToEmail, setReplyToEmail] = useState(settings.replyToEmail ?? "")
  const [reminderHours, setReminderHours] = useState(
    settings.sendAppointmentReminderHours.toString()
  )

  const [sendBookingConfirmation, setSendBookingConfirmation] = useState(
    settings.sendBookingConfirmation
  )
  const [sendAppointmentConfirmed, setSendAppointmentConfirmed] = useState(
    settings.sendAppointmentConfirmed
  )
  const [sendAppointmentCancelled, setSendAppointmentCancelled] = useState(
    settings.sendAppointmentCancelled
  )
  const [sendInvoiceOnIssue, setSendInvoiceOnIssue] = useState(
    settings.sendInvoiceOnIssue
  )
  const [sendPaymentReceipt, setSendPaymentReceipt] = useState(
    settings.sendPaymentReceipt
  )
  const [sendEnrollmentConfirmation, setSendEnrollmentConfirmation] = useState(
    settings.sendEnrollmentConfirmation
  )
  const [sendSessionCancelled, setSendSessionCancelled] = useState(
    settings.sendSessionCancelled
  )
  const [sendLevelProgression, setSendLevelProgression] = useState(
    settings.sendLevelProgression
  )

  function handleSave() {
    update.mutate(
      {
        from_email: fromEmail || null,
        from_name: fromName || null,
        reply_to_email: replyToEmail || null,
        send_booking_confirmation: sendBookingConfirmation,
        send_appointment_confirmed: sendAppointmentConfirmed,
        send_appointment_cancelled: sendAppointmentCancelled,
        send_appointment_reminder_hours: Number(reminderHours),
        send_invoice_on_issue: sendInvoiceOnIssue,
        send_payment_receipt: sendPaymentReceipt,
        send_enrollment_confirmation: sendEnrollmentConfirmation,
        send_session_cancelled: sendSessionCancelled,
        send_level_progression: sendLevelProgression,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Notification settings saved",
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
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Sender
          </h2>
          <p className="text-xs text-muted-foreground">
            How outgoing emails appear to recipients
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field label="From email">
            <Input
              className={fieldStyles}
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="noreply@tyga.co.za"
            />
          </Field>

          <Field label="From name">
            <Input
              className={fieldStyles}
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="TYGA"
            />
          </Field>

          <Field label="Reply-to email">
            <Input
              className={fieldStyles}
              type="email"
              value={replyToEmail}
              onChange={(e) => setReplyToEmail(e.target.value)}
              placeholder="hello@tyga.co.za"
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Appointments
          </h2>
          <p className="text-xs text-muted-foreground">
            Which emails are sent for the assessment flow
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <ToggleRow
            label="Booking confirmation"
            hint="Sent to the parent when they book a slot"
            checked={sendBookingConfirmation}
            onChange={setSendBookingConfirmation}
          />
          <ToggleRow
            label="Appointment confirmed"
            hint="Sent to the parent when the academy confirms"
            checked={sendAppointmentConfirmed}
            onChange={setSendAppointmentConfirmed}
          />
          <ToggleRow
            label="Appointment cancelled"
            hint="Sent to both parties when an appointment is cancelled"
            checked={sendAppointmentCancelled}
            onChange={setSendAppointmentCancelled}
          />

          <div className="pt-4">
            <Field
              label="Reminder lead time (hours)"
              hint="Send a reminder this many hours before the appointment"
            >
              <Input
                className={fieldStyles}
                type="number"
                min="1"
                value={reminderHours}
                onChange={(e) => setReminderHours(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Programmes
          </h2>
          <p className="text-xs text-muted-foreground">
            Emails related to enrolments and sessions
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <ToggleRow
            label="Enrollment confirmation"
            hint="Sent when a member is enrolled in a programme"
            checked={sendEnrollmentConfirmation}
            onChange={setSendEnrollmentConfirmation}
          />
          <ToggleRow
            label="Session cancelled"
            hint="Sent when a programme session is cancelled"
            checked={sendSessionCancelled}
            onChange={setSendSessionCancelled}
          />
          <ToggleRow
            label="Level progression"
            hint="Sent when a child moves to a new level"
            checked={sendLevelProgression}
            onChange={setSendLevelProgression}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Payments
          </h2>
          <p className="text-xs text-muted-foreground">
            Emails related to invoices and payments
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <ToggleRow
            label="Invoice issued"
            hint="Sent when an invoice is issued"
            checked={sendInvoiceOnIssue}
            onChange={setSendInvoiceOnIssue}
          />
          <ToggleRow
            label="Payment receipt"
            hint="Sent when a payment is received"
            checked={sendPaymentReceipt}
            onChange={setSendPaymentReceipt}
          />
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
