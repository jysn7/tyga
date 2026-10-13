import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export const FINANCE_PAGE_SIZE = 25

export type DisplayStatus =
  "pending" | "paid" | "overdue" | "on_hold" | "cancelled"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
export type ManualMethod = "eft" | "cash" | "other"

export type FinanceOverview = {
  revenue_this_month: number
  revenue_last_month: number
  payments_this_month: number
  outstanding_amount: number
  outstanding_count: number
  overdue_amount: number
  overdue_count: number
  on_hold_amount: number
  on_hold_count: number
  refund_reviews: number
  memberships: { active: number; attention: number; monthly_value: number }
  revenue_by_month: { month_start: string; label: string; revenue: number }[]
  revenue_by_programme_type: { programme_type: string; revenue: number }[]
}

export type InvoiceRow = {
  invoice_id: number
  account_id: string
  account_name: string | null
  description: string | null
  enrollment_id: number | null
  member_name: string | null
  programme_name: string | null
  status: string
  display_status: DisplayStatus
  total_amount: number
  issued_at: string | null
  due_at: string | null
  paid_at: string | null
  refund_review: boolean
  total_count: number
}

export type InvoiceDetail = {
  invoice_id: number
  status: string
  display_status: DisplayStatus
  total_amount: number
  issued_at: string | null
  due_at: string | null
  account: {
    id: string | null
    full_name: string | null
    email: string | null
    phone: string | null
  }
  line_items: {
    id: number
    item_type: string | null
    description: string | null
    amount: number
  }[]
  payments: {
    id: number
    amount: number
    method: string | null
    channel: string | null
    status: PaymentStatus
    gateway_reference: string | null
    paid_at: string | null
    note: string | null
    recorded_by: string | null
  }[]
  enrollment: {
    id: number
    status: string
    member_id: number
    member_name: string
    programme_id: number
    programme_name: string
  } | null
  refund_review: boolean
  allowed_actions: "record_payment"[]
}

export type PaymentRow = {
  payment_id: number
  invoice_id: number
  account_name: string | null
  member_name: string | null
  amount: number
  method: string | null
  channel: string | null
  gateway_reference: string | null
  status: PaymentStatus
  paid_at: string | null
  note: string | null
  recorded_by: string | null
  total_count: number
}

export type RefundRow = {
  enrollment_id: number
  member_name: string
  parent_name: string | null
  programme_name: string
  enrollment_status: string
  invoice_id: number
  amount: number | null
  paid_at: string | null
  flagged_at: string
  reason: string | null
}

export type MembershipRow = {
  id: number
  account_id: string
  account_full_name: string | null
  account_email: string | null
  status: string
  amount: number
  interval: string
  current_period_end: string | null
  next_charge_at: string | null
  created_at: string
}

export type InvoiceFilters = {
  status: DisplayStatus | null
  search: string
  page: number
}

export type PaymentFilters = {
  status: PaymentStatus | null
  search: string
  page: number
}

const KEY = ["admin-finance"] as const

function useRefreshMoneyViews() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: KEY })
    qc.invalidateQueries({ queryKey: ["admin-enrollments"] })
    qc.invalidateQueries({ queryKey: ["parent-schedule"] })
    qc.invalidateQueries({ queryKey: ["coach-roster"] })
  }
}

export function useFinanceOverview() {
  return useQuery({
    queryKey: [...KEY, "overview"],
    queryFn: async (): Promise<FinanceOverview> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_get_finance_overview", {
        p_months: 12,
      })
      if (error) throw new Error(error.message)
      return data as FinanceOverview
    },
    staleTime: 30_000,
  })
}

export function useAdminInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: [...KEY, "invoices", filters],
    queryFn: async (): Promise<InvoiceRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_get_invoices", {
        p_status: filters.status,
        p_search: filters.search.trim() || null,
        p_from: null,
        p_to: null,
        p_limit: FINANCE_PAGE_SIZE,
        p_offset: filters.page * FINANCE_PAGE_SIZE,
      })
      if (error) throw new Error(error.message)
      return (data ?? []) as InvoiceRow[]
    },
    placeholderData: keepPreviousData,
  })
}

export function useAdminInvoiceDetail(invoiceId: number | null) {
  return useQuery({
    queryKey: [...KEY, "invoice", invoiceId],
    queryFn: async (): Promise<InvoiceDetail> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_get_invoice_detail", {
        p_invoice_id: invoiceId,
      })
      if (error) throw new Error(error.message)
      return data as InvoiceDetail
    },
    enabled: invoiceId !== null,
  })
}

export function useAdminPayments(filters: PaymentFilters) {
  return useQuery({
    queryKey: [...KEY, "payments", filters],
    queryFn: async (): Promise<PaymentRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_get_payments", {
        p_status: filters.status,
        p_search: filters.search.trim() || null,
        p_from: null,
        p_to: null,
        p_limit: FINANCE_PAGE_SIZE,
        p_offset: filters.page * FINANCE_PAGE_SIZE,
      })
      if (error) throw new Error(error.message)
      return (data ?? []) as PaymentRow[]
    },
    placeholderData: keepPreviousData,
  })
}

export function useRefundQueue() {
  return useQuery({
    queryKey: [...KEY, "refunds"],
    queryFn: async (): Promise<RefundRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_get_refund_queue")
      if (error) throw new Error(error.message)
      return (data ?? []) as RefundRow[]
    },
  })
}

export function useAdminMemberships(status: string | null) {
  return useQuery({
    queryKey: [...KEY, "memberships", status],
    queryFn: async (): Promise<MembershipRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_get_memberships", {
        p_account_id: null,
        p_status: status,
      })
      if (error) throw new Error(error.message)
      return (data ?? []) as MembershipRow[]
    },
  })
}

export function useRecordManualPayment() {
  const refresh = useRefreshMoneyViews()
  return useMutation({
    mutationFn: async (input: {
      invoiceId: number
      method: ManualMethod
      reference?: string
      paidOn?: string // YYYY-MM-DD
      note?: string
    }) => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc(
        "admin_record_manual_payment",
        {
          p_invoice_id: input.invoiceId,
          p_method: input.method,
          p_reference: input.reference?.trim() || null,
          p_paid_on: input.paidOn || null,
          p_note: input.note?.trim() || null,
        }
      )
      if (error) throw new Error(error.message)
      return data as {
        applied: boolean
        reason?: string
        enrollment_activated?: boolean
      }
    },
    onSuccess: refresh,
  })
}

export function useRecordRefund() {
  const refresh = useRefreshMoneyViews()
  return useMutation({
    mutationFn: async (input: { enrollmentId: number; note?: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_record_refund", {
        p_enrollment_id: input.enrollmentId,
        p_note: input.note?.trim() || null,
      })
      if (error) throw new Error(error.message)
      return data as { payment_id: number; amount: number }
    },
    onSuccess: refresh,
  })
}

// "No refund is due": closes the review without changing the payment
export function useCloseRefundReview() {
  const refresh = useRefreshMoneyViews()
  return useMutation({
    mutationFn: async (enrollmentId: number) => {
      const supabase = createClient()
      const { error } = await supabase.rpc("admin_resolve_refund_review", {
        p_enrollment_id: enrollmentId,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: refresh,
  })
}
