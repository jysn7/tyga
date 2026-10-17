import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import {
  anonymiseAccount,
  removeAccountMfa,
  sendPasswordReset,
} from "@/lib/admin/actions"

export const ACCOUNTS_PAGE_SIZE = 100

export type AccountRole = "parent" | "coach" | "admin"

// What the table row uses
export type Account = {
  id: string
  role: AccountRole
  fullName: string
  email: string
  phone: string | null
  address: string | null
  avatarUrl: string | null
  active: boolean
  createdAt: string
  lastSignInAt: string | null
  hasMfa: boolean
  childrenCount: number
  anonymised: boolean
  totalCount: number
}

type AccountRowDb = {
  id: string
  role: AccountRole
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  active: boolean
  created_at: string
  last_sign_in_at: string | null
  has_mfa: boolean
  children_count: number
  anonymised: boolean
  total_count: number
}

function toAccount(r: AccountRowDb): Account {
  return {
    id: r.id,
    role: r.role,
    fullName: r.full_name ?? "Unnamed",
    email: r.email ?? "",
    phone: r.phone,
    address: r.address,
    avatarUrl: r.avatar_url,
    active: r.active,
    createdAt: r.created_at,
    lastSignInAt: r.last_sign_in_at,
    hasMfa: r.has_mfa,
    childrenCount: Number(r.children_count),
    anonymised: r.anonymised,
    totalCount: Number(r.total_count),
  }
}

export type AccountDetail = {
  id: string
  role: AccountRole
  full_name: string | null
  email: string | null
  phone: string | null
  alt_phone: string | null
  whatsapp_number: string | null
  area: string | null
  active: boolean
  created_at: string
  anonymised_at: string | null
  is_self: boolean
  last_sign_in_at: string | null
  banned: boolean
  providers: string[]
  has_mfa: boolean
  mfa_factors: { type: string; name: string | null; added_at: string }[]
  children: {
    id: number
    full_name: string
    archived: boolean
    open_enrolments: number
  }[]
  coach: {
    id: number
    coach_type: string | null
    max_student_ratio: number | null
    programmes: number
    upcoming_sessions: number
  } | null
  membership: {
    status: string
    amount: number
    interval: string
    next_charge_at: string | null
  } | null
  open_invoices: { count: number; amount: number }
  other_active_admins: number
  anonymise_blockers: string[]
  history: {
    action: string
    reason: string | null
    by: string | null
    at: string
    details: Record<string, unknown>
  }[]
}

export type AccountFilters = {
  role?: AccountRole | null
  active?: boolean | null
  search?: string
  page?: number
}

const KEY = ["admin-accounts"] as const

// Works with no arguments, like your old hook. Add filters whenever the table gets them.
export function useAccounts(filters: AccountFilters = {}) {
  const { role = null, active = null, search = "", page = 0 } = filters

  return useQuery({
    queryKey: [...KEY, "list", role, active, search, page],
    queryFn: async (): Promise<Account[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_get_accounts_page", {
        p_role: role,
        p_active: active,
        p_search: search.trim() || null,
        p_limit: ACCOUNTS_PAGE_SIZE,
        p_offset: page * ACCOUNTS_PAGE_SIZE,
      })
      if (error) throw new Error(error.message)
      return ((data ?? []) as AccountRowDb[]).map(toAccount)
    },
    placeholderData: keepPreviousData,
  })
}

export function useAccountDetail(accountId: string | null) {
  return useQuery({
    queryKey: [...KEY, "detail", accountId],
    queryFn: async (): Promise<AccountDetail> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("admin_get_account_detail", {
        p_account_id: accountId,
      })
      if (error) throw new Error(error.message)
      return data as AccountDetail
    },
    enabled: accountId !== null,
  })
}

function useRefresh() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: KEY })
}

export function useSetAccountRole() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: {
      accountId: string
      role: AccountRole
      reason: string
    }) => {
      const supabase = createClient()
      const { error } = await supabase.rpc("admin_set_account_role", {
        p_account_id: input.accountId,
        p_role: input.role,
        p_reason: input.reason.trim() || null,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: refresh,
  })
}

export function useSetAccountActive() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: {
      accountId: string
      active: boolean
      reason?: string
    }) => {
      const supabase = createClient()
      const { error } = await supabase.rpc("admin_set_account_active", {
        p_account_id: input.accountId,
        p_active: input.active,
        p_reason: input.reason?.trim() || null,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: refresh,
  })
}

export function useSendPasswordReset() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (accountId: string) => {
      const res = await sendPasswordReset(accountId)
      if (res.error) throw new Error(res.error)
    },
    onSuccess: refresh,
  })
}

export function useRemoveAccountMfa() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: { accountId: string; reason: string }) => {
      const res = await removeAccountMfa(input.accountId, input.reason)
      if (res.error) throw new Error(res.error)
    },
    onSuccess: refresh,
  })
}

export function useAnonymiseAccount() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: {
      accountId: string
      confirmEmail: string
      reason: string
    }) => {
      const res = await anonymiseAccount(input)
      if (res.error) throw new Error(res.error)
      return res.warning ?? null
    },
    onSuccess: refresh,
  })
}
