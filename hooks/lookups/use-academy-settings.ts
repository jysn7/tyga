// hooks/lookups/use-app-settings.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

// ---------- Types ----------

export type AppSettings = {
  // Academy
  bookingLeadHours: number
  bookingLookaheadDays: number
  defaultSlotMinutes: number
  cancellationCutoffHours: number
  defaultMaxRatio: number
  timezone: string

  // Site
  siteName: string
  siteTagline: string | null
  logoUrl: string | null
  faviconUrl: string | null
  primaryColor: string
  supportEmail: string | null
  supportPhone: string | null
  whatsappNumber: string | null
  termsUrl: string | null
  privacyUrl: string | null
  cancellationPolicyText: string | null
  defaultConsentVersion: string

  // Notifications
  fromEmail: string | null
  fromName: string | null
  replyToEmail: string | null
  sendBookingConfirmation: boolean
  sendAppointmentConfirmed: boolean
  sendAppointmentCancelled: boolean
  sendAppointmentReminderHours: number
  sendInvoiceOnIssue: boolean
  sendPaymentReceipt: boolean
  sendEnrollmentConfirmation: boolean
  sendSessionCancelled: boolean
  sendLevelProgression: boolean

  // Payments
  currency: string
  vatEnabled: boolean
  vatRate: number
  vatNumber: string | null
  invoicePrefix: string
  invoiceDueDays: number
  bankDetails: string | null

  // Membership
  membershipFeeAmount: number
  membershipFeeInterval: string
  membershipFeeDescription: string | null
  membershipRequired: boolean
  membershipPlanCode: string | null
  membershipGraceDays: number
}

// Raw row — snake_case, exactly matches the app_settings table
export type AppSettingsRow = {
  booking_lead_hours: number
  booking_lookahead_days: number
  default_slot_minutes: number
  cancellation_cutoff_hours: number
  default_max_ratio: number
  timezone: string
  site_name: string
  site_tagline: string | null
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  support_email: string | null
  support_phone: string | null
  whatsapp_number: string | null
  terms_url: string | null
  privacy_url: string | null
  cancellation_policy_text: string | null
  default_consent_version: string
  from_email: string | null
  from_name: string | null
  reply_to_email: string | null
  send_booking_confirmation: boolean
  send_appointment_confirmed: boolean
  send_appointment_cancelled: boolean
  send_appointment_reminder_hours: number
  send_invoice_on_issue: boolean
  send_payment_receipt: boolean
  send_enrollment_confirmation: boolean
  send_session_cancelled: boolean
  send_level_progression: boolean
  currency: string
  vat_enabled: boolean
  vat_rate: number
  vat_number: string | null
  invoice_prefix: string
  invoice_due_days: number
  bank_details: string | null
  membership_fee_amount: number
  membership_fee_interval: string
  membership_fee_description: string | null
  membership_required: boolean
  membership_plan_code: string | null
  membership_grace_days: number
}

function toAppSettings(row: AppSettingsRow): AppSettings {
  return {
    bookingLeadHours: row.booking_lead_hours,
    bookingLookaheadDays: row.booking_lookahead_days,
    defaultSlotMinutes: row.default_slot_minutes,
    cancellationCutoffHours: row.cancellation_cutoff_hours,
    defaultMaxRatio: row.default_max_ratio,
    timezone: row.timezone,

    siteName: row.site_name,
    siteTagline: row.site_tagline,
    logoUrl: row.logo_url,
    faviconUrl: row.favicon_url,
    primaryColor: row.primary_color,
    supportEmail: row.support_email,
    supportPhone: row.support_phone,
    whatsappNumber: row.whatsapp_number,
    termsUrl: row.terms_url,
    privacyUrl: row.privacy_url,
    cancellationPolicyText: row.cancellation_policy_text,
    defaultConsentVersion: row.default_consent_version,

    fromEmail: row.from_email,
    fromName: row.from_name,
    replyToEmail: row.reply_to_email,
    sendBookingConfirmation: row.send_booking_confirmation,
    sendAppointmentConfirmed: row.send_appointment_confirmed,
    sendAppointmentCancelled: row.send_appointment_cancelled,
    sendAppointmentReminderHours: row.send_appointment_reminder_hours,
    sendInvoiceOnIssue: row.send_invoice_on_issue,
    sendPaymentReceipt: row.send_payment_receipt,
    sendEnrollmentConfirmation: row.send_enrollment_confirmation,
    sendSessionCancelled: row.send_session_cancelled,
    sendLevelProgression: row.send_level_progression,

    currency: row.currency,
    vatEnabled: row.vat_enabled,
    vatRate: row.vat_rate,
    vatNumber: row.vat_number,
    invoicePrefix: row.invoice_prefix,
    invoiceDueDays: row.invoice_due_days,
    bankDetails: row.bank_details,

    membershipFeeAmount: row.membership_fee_amount,
    membershipFeeInterval: row.membership_fee_interval,
    membershipFeeDescription: row.membership_fee_description,
    membershipRequired: row.membership_required,
    membershipPlanCode: row.membership_plan_code,
    membershipGraceDays: row.membership_grace_days,
  }
}

// ---------- Main hooks ----------

export function useAppSettings() {
  return useQuery({
    queryKey: ["app-settings"],
    queryFn: async (): Promise<AppSettings> => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", 1)
        .single()
      if (error) throw error
      return toAppSettings(data as AppSettingsRow)
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useUpdateAppSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: Partial<AppSettingsRow>) => {
      const { error } = await supabase.rpc("admin_update_app_settings", {
        p_patch: patch,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings"] })
    },
  })
}

// ---------- Convenience reads (safe defaults) ----------

export function useBehaviourSettings() {
  const { data } = useAppSettings()
  return {
    bookingLeadHours: data?.bookingLeadHours ?? 24,
    bookingLookaheadDays: data?.bookingLookaheadDays ?? 56,
    cancellationCutoffHours: data?.cancellationCutoffHours ?? 24,
    defaultSlotMinutes: data?.defaultSlotMinutes ?? 60,
    defaultMaxRatio: data?.defaultMaxRatio ?? 6,
    timezone: data?.timezone ?? "Africa/Johannesburg",
  }
}

export function useBrandingSettings() {
  const { data } = useAppSettings()
  return {
    siteName: data?.siteName ?? "TYGA",
    siteTagline: data?.siteTagline ?? null,
    logoUrl: data?.logoUrl ?? null,
    primaryColor: data?.primaryColor ?? "#000000",
    supportEmail: data?.supportEmail ?? null,
    supportPhone: data?.supportPhone ?? null,
    whatsappNumber: data?.whatsappNumber ?? null,
  }
}

export function usePaymentSettings() {
  const { data } = useAppSettings()
  return {
    currency: data?.currency ?? "ZAR",
    vatEnabled: data?.vatEnabled ?? false,
    vatRate: data?.vatRate ?? 15,
    vatNumber: data?.vatNumber ?? null,
    invoicePrefix: data?.invoicePrefix ?? "INV-",
    invoiceDueDays: data?.invoiceDueDays ?? 7,
    bankDetails: data?.bankDetails ?? null,
  }
}

export function useMembershipSettings() {
  const { data } = useAppSettings()
  return {
    feeAmount: data?.membershipFeeAmount ?? 0,
    feeInterval: data?.membershipFeeInterval ?? "monthly",
    feeDescription: data?.membershipFeeDescription ?? null,
    required: data?.membershipRequired ?? true,
    planCode: data?.membershipPlanCode ?? null,
    graceDays: data?.membershipGraceDays ?? 7,
  }
}

export function useUpdateMembershipSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: {
      required?: boolean
      feeAmount?: number
      feeInterval?: string
      feeDescription?: string | null
      planCode?: string | null
      graceDays?: number
    }) => {
      const { error } = await supabase.rpc("admin_update_membership_settings", {
        p_required: patch.required ?? null,
        p_fee_amount: patch.feeAmount ?? null,
        p_fee_interval: patch.feeInterval ?? null,
        p_fee_description: patch.feeDescription ?? null,
        p_plan_code: patch.planCode ?? null,
        p_grace_days: patch.graceDays ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings"] })
    },
  })
}
