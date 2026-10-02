// lib/hooks/use-invoices.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { Invoice, InvoiceDetail } from "@/lib/types"

// ============================================================
// Types
// ============================================================

type InvoiceRow = {
  id: number
  issued_at: string
  due_at: string
  total_amount: number | string
  status: Invoice["status"]
  item_count?: number | string | null
  paid_amount?: number | string | null
  outstanding_amount?: number | string | null
}

type InvoiceDetailRow = InvoiceRow & {
  line_items?: LineItemRow[] | null
  payments?: PaymentRow[] | null
}

type LineItemRow = {
  id: number
  item_type: string
  description: string
  amount: number | string
}

type PaymentRow = {
  id: number
  amount: number | string
  method: string
  status: string
  paid_at: string | null
  gateway_reference: string | null
}

// Payments list row — matches parent_get_payments return shape
type PaymentListRow = {
  id: number
  invoice_id: number
  amount: number | string
  method: string | null
  status: string | null
  channel: string | null
  gateway_reference: string | null
  paystack_transaction_id: number | string | null
  paid_at: string | null
}

// Payment summary row — matches parent_get_payment_summary return shape
type PaymentSummaryRow = {
  total_paid: number | string
  total_outstanding: number | string
  next_due_at: string | null
  next_due_amount: number | string | null
  last_payment_at: string | null
  last_payment_amount: number | string | null
}

// ============================================================
// Domain types
// ============================================================

export type Payment = {
  id: number
  invoiceId: number
  amount: number
  method: string | null
  status: string | null
  channel: string | null
  gatewayReference: string | null
  paystackTransactionId: number | null
  paidAt: string | null
}

export type PaymentSummary = {
  totalPaid: number
  totalOutstanding: number
  nextDueAt: string | null
  nextDueAmount: number
  lastPaymentAt: string | null
  lastPaymentAmount: number
}

// ============================================================
// Mappers
// ============================================================

function mapInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    issuedAt: row.issued_at,
    dueAt: row.due_at,
    totalAmount: Number(row.total_amount),
    status: row.status,
    itemCount: Number(row.item_count ?? 0),
    paidAmount: Number(row.paid_amount ?? 0),
    outstandingAmount: Number(row.outstanding_amount ?? 0),
  }
}

function mapInvoiceDetail(row: InvoiceDetailRow): InvoiceDetail {
  return {
    id: row.id,
    issuedAt: row.issued_at,
    dueAt: row.due_at,
    totalAmount: Number(row.total_amount),
    status: row.status,
    paidAmount: Number(row.paid_amount ?? 0),
    outstandingAmount: Number(row.outstanding_amount ?? 0),
    lineItems: (row.line_items ?? []).map((li) => ({
      id: li.id,
      itemType: li.item_type,
      description: li.description,
      amount: Number(li.amount),
    })),
    payments: (row.payments ?? []).map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      status: p.status,
      paidAt: p.paid_at,
      gatewayReference: p.gateway_reference,
    })),
  }
}

function mapPayment(row: PaymentListRow): Payment {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    amount: Number(row.amount),
    method: row.method,
    status: row.status,
    channel: row.channel,
    gatewayReference: row.gateway_reference,
    paystackTransactionId:
      row.paystack_transaction_id != null
        ? Number(row.paystack_transaction_id)
        : null,
    paidAt: row.paid_at,
  }
}

function mapPaymentSummary(row: PaymentSummaryRow): PaymentSummary {
  return {
    totalPaid: Number(row.total_paid ?? 0),
    totalOutstanding: Number(row.total_outstanding ?? 0),
    nextDueAt: row.next_due_at,
    nextDueAmount: Number(row.next_due_amount ?? 0),
    lastPaymentAt: row.last_payment_at,
    lastPaymentAmount: Number(row.last_payment_amount ?? 0),
  }
}

// ============================================================
// Invoice hooks (existing)
// ============================================================

export function useInvoices(status?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["invoices", status],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_invoices", {
        p_status: status ?? null,
      })
      if (error) throw error
      return (data ?? []).map(mapInvoice)
    },
  })
}

export function useInvoiceDetail(invoiceId: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["invoices", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_invoice_detail", {
        p_invoice_id: invoiceId,
      })
      if (error) throw error
      return mapInvoiceDetail(data)
    },
    enabled: !!invoiceId,
  })
}

// ============================================================
// Payment hooks (new)
// ============================================================

export type PaymentFilters = {
  from?: string
  to?: string
  status?: "pending" | "successful" | "failed" | "refunded" | null
  method?: "card" | "eft" | "cash" | "debit_order" | "other" | null
}

export function usePayments(filters: PaymentFilters = {}) {
  const supabase = createClient()
  const { from, to, status, method } = filters

  return useQuery({
    queryKey: [
      "payments",
      from ?? "any",
      to ?? "any",
      status ?? "all",
      method ?? "all",
    ],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase.rpc("parent_get_payments", {
        p_from: from ?? null,
        p_to: to ?? null,
        p_status: status ?? null,
        p_method: method ?? null,
      })
      if (error) throw error
      return ((data ?? []) as PaymentListRow[]).map(mapPayment)
    },
  })
}

export function usePaymentSummary() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["payments", "summary"],
    queryFn: async (): Promise<PaymentSummary> => {
      const { data, error } = await supabase.rpc("parent_get_payment_summary")
      if (error) throw error

      // The RPC returns a single-row table
      const row = Array.isArray(data) ? data[0] : data
      if (!row) {
        return {
          totalPaid: 0,
          totalOutstanding: 0,
          nextDueAt: null,
          nextDueAmount: 0,
          lastPaymentAt: null,
          lastPaymentAmount: 0,
        }
      }

      return mapPaymentSummary(row as PaymentSummaryRow)
    },
    staleTime: 60 * 1000,
  })
}
