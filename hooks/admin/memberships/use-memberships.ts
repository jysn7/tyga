import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import {
  adminCancelMembership,
  adminSyncMembership,
} from "@/lib/admin/membership/actions"
import type {
  MembershipSource,
  MembershipStatus,
} from "@/hooks/client/use-membership"

/* eslint-disable @typescript-eslint/no-explicit-any */

export const MEMBERSHIP_PAGE_SIZE = 25

export type MembershipSummary = {
  settings: {
    required: boolean
    feeAmount: number | null
    feeInterval: string | null
    planConfigured: boolean
    graceDays: number
  }
  counts: {
    active: number
    nonRenewing: number
    attention: number
    complimentary: number
    ending7d: number
    ended30d: number
  }
  monthlyValue: number
  receivedThisMonth: number
  receivedLastMonth: number
  failed30d: number
}

export type MembershipRow = {
  id: number
  accountId: string
  accountName: string | null
  accountEmail: string | null
  status: MembershipStatus
  source: MembershipSource
  amount: number
  billingInterval: string
  currentPeriodEnd: string | null
  nextChargeAt: string | null
  lastPaymentAt: string | null
  lastFailedAt: string | null
  totalPaid: number
  paidCharges: number
  totalCount: number
}

export type MembershipDetail = {
  account: {
    id: string
    fullName: string | null
    email: string | null
    phone: string | null
    active: boolean
  }
  hasAccess: boolean
  current: {
    id: number
    status: MembershipStatus
    source: MembershipSource
    amount: number
    interval: string
    periodEnd: string | null
    nextChargeAt: string | null
    lastPaymentAt: string | null
    lastFailedAt: string | null
    cancelledAt: string | null
    cancelReason: string | null
    note: string | null
    subscriptionCode: string | null
    hasToken: boolean
    isOpen: boolean
  } | null
  totalPaid: number
  charges: {
    id: number
    amount: number
    status: string
    paidAt: string | null
    periodEnd: string | null
    source: string
    method: string | null
    reference: string
    note: string | null
    recordedBy: string | null
  }[]
  history: {
    id: number
    status: string
    source: string
    started: string
    ended: string | null
  }[]
  actions: {
    action: string
    reason: string | null
    by: string | null
    at: string
  }[]
}

export type MembershipFilters = {
  status: MembershipStatus | null
  source: MembershipSource | null
  search: string
  page: number
}

const KEY = ["admin-memberships"] as const

export function useMembershipSummary() {
  return useQuery({
    queryKey: [...KEY, "summary"],
    queryFn: async (): Promise<MembershipSummary> => {
      const { data, error } = await createClient().rpc(
        "admin_get_membership_summary"
      )
      if (error) throw new Error(error.message)
      const r = data as any
      return {
        settings: {
          required: r.settings.required,
          feeAmount:
            r.settings.fee_amount != null
              ? Number(r.settings.fee_amount)
              : null,
          feeInterval: r.settings.fee_interval ?? null,
          planConfigured: r.settings.plan_configured,
          graceDays: r.settings.grace_days,
        },
        counts: {
          active: r.counts.active,
          nonRenewing: r.counts.non_renewing,
          attention: r.counts.attention,
          complimentary: r.counts.complimentary,
          ending7d: r.counts.ending_7d,
          ended30d: r.counts.ended_30d,
        },
        monthlyValue: Number(r.monthly_value),
        receivedThisMonth: Number(r.received_this_month),
        receivedLastMonth: Number(r.received_last_month),
        failed30d: r.failed_30d,
      }
    },
    staleTime: 30_000,
  })
}

export function useMembershipsPage(f: MembershipFilters) {
  return useQuery({
    queryKey: [...KEY, "list", f],
    queryFn: async (): Promise<MembershipRow[]> => {
      const { data, error } = await createClient().rpc(
        "admin_get_memberships_page",
        {
          p_status: f.status,
          p_source: f.source,
          p_search: f.search.trim() || null,
          p_limit: MEMBERSHIP_PAGE_SIZE,
          p_offset: f.page * MEMBERSHIP_PAGE_SIZE,
        }
      )
      if (error) throw new Error(error.message)
      return (data ?? []).map((r: any) => ({
        id: r.id,
        accountId: r.account_id,
        accountName: r.account_name,
        accountEmail: r.account_email,
        status: r.status,
        source: r.source,
        amount: Number(r.amount),
        billingInterval: r.billing_interval,
        currentPeriodEnd: r.current_period_end,
        nextChargeAt: r.next_charge_at,
        lastPaymentAt: r.last_payment_at,
        lastFailedAt: r.last_failed_at,
        totalPaid: Number(r.total_paid),
        paidCharges: Number(r.paid_charges),
        totalCount: Number(r.total_count),
      }))
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })
}

export function useMembershipDetail(accountId: string | null) {
  return useQuery({
    queryKey: [...KEY, "detail", accountId],
    queryFn: async (): Promise<MembershipDetail> => {
      const { data, error } = await createClient().rpc(
        "admin_get_membership_detail",
        {
          p_account_id: accountId,
        }
      )
      if (error) throw new Error(error.message)
      const r = data as any
      return {
        account: {
          id: r.account.id,
          fullName: r.account.full_name,
          email: r.account.email,
          phone: r.account.phone,
          active: r.account.active,
        },
        hasAccess: !!r.has_access,
        current: r.current
          ? {
              id: r.current.id,
              status: r.current.status,
              source: r.current.source,
              amount: Number(r.current.amount),
              interval: r.current.interval,
              periodEnd: r.current.period_end,
              nextChargeAt: r.current.next_charge_at,
              lastPaymentAt: r.current.last_payment_at,
              lastFailedAt: r.current.last_failed_at,
              cancelledAt: r.current.cancelled_at,
              cancelReason: r.current.cancel_reason,
              note: r.current.note,
              subscriptionCode: r.current.subscription_code,
              hasToken: !!r.current.has_token,
              isOpen: !!r.current.is_open,
            }
          : null,
        totalPaid: Number(r.total_paid),
        charges: (r.charges ?? []).map((c: any) => ({
          id: c.id,
          amount: Number(c.amount),
          status: c.status,
          paidAt: c.paid_at,
          periodEnd: c.period_end,
          source: c.source,
          method: c.method,
          reference: c.reference,
          note: c.note,
          recordedBy: c.recorded_by,
        })),
        history: r.history ?? [],
        actions: r.actions ?? [],
      }
    },
    enabled: accountId !== null,
  })
}

function useRefresh() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: KEY })
    qc.invalidateQueries({ queryKey: ["admin-finance"] })
    qc.invalidateQueries({ queryKey: ["admin-accounts"] })
    // If a parent action (start/cancel/resume) can be triggered from the admin UI:
    qc.invalidateQueries({ queryKey: ["membership"] })
  }
}

export function useGrantComplimentary() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (i: {
      accountId: string
      until: string
      reason: string
    }): Promise<{ ok: true }> => {
      const { error } = await createClient().rpc(
        "admin_grant_complimentary_membership",
        {
          p_account_id: i.accountId,
          p_until: i.until,
          p_reason: i.reason,
        }
      )
      if (error) throw new Error(error.message)
      return { ok: true }
    },
    onSuccess: refresh,
  })
}

export function useRecordMembershipPayment() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (i: {
      accountId: string
      periods: number
      method: "eft" | "cash" | "other"
      reference?: string
      paidOn?: string
      amount?: number | null
      note?: string
    }): Promise<{ ok: true }> => {
      const { error } = await createClient().rpc(
        "admin_record_membership_payment",
        {
          p_account_id: i.accountId,
          p_periods: i.periods,
          p_method: i.method,
          p_reference: i.reference?.trim() || null,
          p_paid_on: i.paidOn || null,
          p_amount: i.amount ?? null,
          p_note: i.note?.trim() || null,
        }
      )
      if (error) throw new Error(error.message)
      return { ok: true }
    },
    onSuccess: refresh,
  })
}

export function useEndMembership() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (i: {
      accountId: string
      reason: string
    }): Promise<{ ok: true }> => {
      const { error } = await createClient().rpc("admin_end_membership", {
        p_account_id: i.accountId,
        p_reason: i.reason,
      })
      if (error) throw new Error(error.message)
      return { ok: true }
    },
    onSuccess: refresh,
  })
}

export function useCancelCardMembership() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (i: {
      accountId: string
      reason: string
    }): Promise<{ ok: true }> => {
      const r = await adminCancelMembership(i.accountId, i.reason)
      if (r.error) throw new Error(r.error)
      return { ok: true }
    },
    onSuccess: refresh,
  })
}

export function useSyncMembership() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (accountId: string): Promise<{ ok: true }> => {
      const r = await adminSyncMembership(accountId)
      if (r.error) throw new Error(r.error)
      return { ok: true }
    },
    onSuccess: refresh,
  })
}
