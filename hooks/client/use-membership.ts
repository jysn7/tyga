import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import {
  cancelMyMembership,
  getCardUpdateLink,
  resumeMyMembership,
  startMembership,
} from "@/lib/admin/membership/actions"

/* eslint-disable @typescript-eslint/no-explicit-any */

export type MembershipStatus =
  "pending" | "active" | "non_renewing" | "attention" | "cancelled" | "expired"

export type MembershipSource = "paystack" | "manual" | "complimentary"

export type MyMembership = {
  required: boolean
  hasAccess: boolean
  planConfigured: boolean
  canStart: boolean
  graceDays: number
  fee: {
    amount: number | null
    interval: string | null
    description: string | null
  }
  membership: {
    id: number
    status: MembershipStatus
    source: MembershipSource
    amount: number
    interval: string
    periodEnd: string | null
    nextChargeAt: string | null
    startedAt: string
    cancelledAt: string | null
    lastPaymentAt: string | null
    lastFailedAt: string | null
    graceUntil: string | null
    isOpen: boolean
    canCancel: boolean
    canResume: boolean
    canUpdateCard: boolean
  } | null
  charges: {
    id: number
    amount: number
    status: "paid" | "failed" | "refunded"
    paidAt: string | null
    periodStart: string | null
    periodEnd: string | null
    source: "paystack" | "manual"
    method: string | null
    channel: string | null
    reference: string
  }[]
}

const KEY = ["membership", "me"] as const

export const intervalWord = (i: string | null | undefined) =>
  (
    ({
      monthly: "month",
      annually: "year",
      annual: "year",
      quarterly: "quarter",
      biannually: "6 months",
      weekly: "week",
      daily: "day",
    }) as Record<string, string>
  )[(i ?? "monthly").toLowerCase()] ?? "month"

function map(r: any): MyMembership {
  const m = r.membership
  return {
    required: !!r.required,
    hasAccess: !!r.has_access,
    planConfigured: !!r.plan_configured,
    canStart: !!r.can_start,
    graceDays: r.grace_days ?? 7,
    fee: {
      amount: r.fee?.amount != null ? Number(r.fee.amount) : null,
      interval: r.fee?.interval ?? null,
      description: r.fee?.description ?? null,
    },
    membership: m
      ? {
          id: m.id,
          status: m.status,
          source: m.source,
          amount: Number(m.amount),
          interval: m.interval,
          periodEnd: m.period_end ?? null,
          nextChargeAt: m.next_charge_at ?? null,
          startedAt: m.started_at,
          cancelledAt: m.cancelled_at ?? null,
          lastPaymentAt: m.last_payment_at ?? null,
          lastFailedAt: m.last_failed_at ?? null,
          graceUntil: m.grace_until ?? null,
          isOpen: !!m.is_open,
          canCancel: !!m.can_cancel,
          canResume: !!m.can_resume,
          canUpdateCard: !!m.can_update_card,
        }
      : null,
    charges: (r.charges ?? []).map((c: any) => ({
      id: c.id,
      amount: Number(c.amount),
      status: c.status,
      paidAt: c.paid_at ?? null,
      periodStart: c.period_start ?? null,
      periodEnd: c.period_end ?? null,
      source: c.source,
      method: c.method ?? null,
      channel: c.channel ?? null,
      reference: c.reference,
    })),
  }
}

// pollWhile: keep checking every 3 seconds, for the moment after coming back from the payment page
export function useMyMembership(opts: { pollWhile?: boolean } = {}) {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<MyMembership> => {
      const { data, error } = await createClient().rpc("get_my_membership")
      if (error) throw new Error(error.message)
      return map(data)
    },
    refetchInterval: opts.pollWhile ? 3000 : false,
    staleTime: opts.pollWhile ? 0 : 30_000,
  })
}

function useRefresh() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ["membership"] })
  }
}

// Goes to Paystack's payment page on success
export function useStartMembership() {
  return useMutation({
    mutationFn: async (): Promise<{ ok: true }> => {
      const res = await startMembership()
      if (res.error || !res.url) throw new Error(res.error ?? "Could not start")
      window.location.assign(res.url)
      return { ok: true }
    },
  })
}

export function useCancelMembership() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (): Promise<{ ok: true }> => {
      const r = await cancelMyMembership()
      if (r.error) throw new Error(r.error)
      return { ok: true }
    },
    onSuccess: refresh,
  })
}

export function useResumeMembership() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (): Promise<{ ok: true }> => {
      const r = await resumeMyMembership()
      if (r.error) throw new Error(r.error)
      return { ok: true }
    },
    onSuccess: refresh,
  })
}

// Opens Paystack's "update your card" page
export function useUpdateCard() {
  return useMutation({
    mutationFn: async (): Promise<{ ok: true }> => {
      const res = await getCardUpdateLink()
      if (res.error || !res.url)
        throw new Error(res.error ?? "Could not open the card page")
      window.location.assign(res.url)
      return { ok: true }
    },
  })
}
