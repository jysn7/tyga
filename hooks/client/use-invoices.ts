// lib/hooks/use-invoices.ts
"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import type { Invoice, InvoiceDetail } from "@/lib/types"

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
