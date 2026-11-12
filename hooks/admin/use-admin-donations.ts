"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// Types
// ============================================================

export type AdminDonationRow = {
  id: number
  paystackReference: string
  paystackTransactionId: number | null
  donorName: string | null
  donorEmail: string
  amount: number
  currency: string
  status: string
  isAnonymous: boolean
  tierLabel: string | null
  accountId: string | null
  createdAt: string
  verifiedAt: string | null
  receiptIssuedAt: string | null
  refundedAt: string | null
  totalCount: number
}

export type AdminDonationStats = {
  total_amount: number
  total_count: number
  this_month_amount: number
  this_month_count: number
  receipts_pending: number
  by_status: { status: string; count: number }[]
  monthly: { month: string; amount: number; count: number }[]
}

export type AdminDonationDetail = {
  donation: {
    id: number
    paystack_reference: string
    paystack_transaction_id: number | null
    account_id: string | null
    donor_name: string | null
    donor_email: string
    amount: number
    currency: string
    status: string
    is_anonymous: boolean
    tier_label: string | null
    created_at: string
    verified_at: string | null
    receipt_issued_at: string | null
    receipt_issued_by: string | null
    refunded_at: string | null
    refunded_by: string | null
    refund_note: string | null
  }
  account: {
    id: string
    full_name: string | null
    email: string | null
    phone: string | null
  } | null
  receipt_issued_by_name: string | null
  refunded_by_name: string | null
}

export type AdminDonationsParams = {
  status?: string | null
  search?: string | null
  from?: string | null
  to?: string | null
  limit?: number
  offset?: number
}

// ============================================================
// Mappers
// ============================================================

const mapRow = (r: any): AdminDonationRow => ({
  id: Number(r.id),
  paystackReference: r.paystack_reference,
  paystackTransactionId: r.paystack_transaction_id ?? null,
  donorName: r.donor_name ?? null,
  donorEmail: r.donor_email,
  amount: Number(r.amount),
  currency: r.currency,
  status: r.status,
  isAnonymous: !!r.is_anonymous,
  tierLabel: r.tier_label ?? null,
  accountId: r.account_id ?? null,
  createdAt: r.created_at,
  verifiedAt: r.verified_at ?? null,
  receiptIssuedAt: r.receipt_issued_at ?? null,
  refundedAt: r.refunded_at ?? null,
  totalCount: Number(r.total_count ?? 0),
})

// ============================================================
// Reads
// ============================================================

export function useAdminDonations(params: AdminDonationsParams = {}) {
  return useQuery({
    queryKey: ["admin-donations", params],
    queryFn: async (): Promise<AdminDonationRow[]> => {
      const { data, error } = await createClient().rpc("admin_get_donations", {
        p_status: params.status ?? null,
        p_search: params.search ?? null,
        p_from: params.from ?? null,
        p_to: params.to ?? null,
        p_limit: params.limit ?? 50,
        p_offset: params.offset ?? 0,
      })
      if (error) throw new Error(error.message)
      return (data ?? []).map(mapRow)
    },
    staleTime: 30_000,
  })
}

export function useAdminDonationStats(months = 6) {
  return useQuery({
    queryKey: ["admin-donation-stats", months],
    queryFn: async (): Promise<AdminDonationStats> => {
      const { data, error } = await createClient().rpc(
        "admin_get_donation_stats",
        {
          p_months: months,
        }
      )
      if (error) throw new Error(error.message)
      return data as AdminDonationStats
    },
    staleTime: 60_000,
  })
}

export function useAdminDonationDetail(id: number | null) {
  return useQuery({
    queryKey: ["admin-donation-detail", id],
    queryFn: async (): Promise<AdminDonationDetail> => {
      const { data, error } = await createClient().rpc(
        "admin_get_donation_detail",
        {
          p_id: id,
        }
      )
      if (error) throw new Error(error.message)
      return data as AdminDonationDetail
    },
    enabled: id !== null && id > 0,
    staleTime: 30_000,
  })
}

// ============================================================
// Writes
// ============================================================

export function useMarkReceiptIssued() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await createClient().rpc("admin_mark_receipt_issued", {
        p_id: id,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["admin-donation-detail", id] })
      qc.invalidateQueries({ queryKey: ["admin-donations"] })
      qc.invalidateQueries({ queryKey: ["admin-donation-stats"] })
    },
  })
}

export function useRecordDonationRefund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { id: number; note: string }) => {
      const { error } = await createClient().rpc(
        "admin_record_donation_refund",
        {
          p_id: args.id,
          p_note: args.note,
        }
      )
      if (error) throw new Error(error.message)
    },
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: ["admin-donation-detail", args.id] })
      qc.invalidateQueries({ queryKey: ["admin-donations"] })
      qc.invalidateQueries({ queryKey: ["admin-donation-stats"] })
    },
  })
}

// ============================================================
// CSV export
// ============================================================

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: unknown): string => {
    const s = v == null ? "" : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ]
  return lines.join("\n")
}

export function useExportDonations() {
  return useMutation({
    mutationFn: async (args: { from?: string | null; to?: string | null }) => {
      const { data, error } = await createClient().rpc(
        "admin_export_donations",
        {
          p_from: args.from ?? null,
          p_to: args.to ?? null,
        }
      )
      if (error) throw new Error(error.message)
      return toCsv((data ?? []) as Record<string, unknown>[])
    },
  })
}
