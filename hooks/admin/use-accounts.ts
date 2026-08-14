import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type Account = {
  id: string
  role: "parent" | "coach" | "admin"
  fullName: string
  email: string
  phone: string | null
  address: string | null
  active: boolean
  createdAt: string
}

type AccountRow = {
  id: string
  role: "parent" | "coach" | "admin"
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  active: boolean
  created_at: string
}

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name ?? "Unnamed",
    email: row.email ?? "",
    phone: row.phone,
    address: row.address,
    active: row.active,
    createdAt: row.created_at,
  }
}

export type UseAccountsFilters = {
  role?: Account["role"]
  active?: boolean
  search?: string
}

export function useAccounts({ role, active, search }: UseAccountsFilters = {}) {
  const supabase = createClient()

  // Trim + cap length client-side (UX only, not the security boundary — see below).
  const normalizedSearch = search?.trim().slice(0, 100) || undefined

  return useQuery({
    queryKey: [
      "admin-accounts",
      role ?? "all",
      active ?? "all",
      normalizedSearch ?? "",
    ],
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase.rpc("admin_get_accounts", {
        p_role: role ?? null,
        p_active: active ?? null,
        p_search: normalizedSearch ?? null,
      })
      if (error) throw error
      return (data as AccountRow[]).map(toAccount)
    },
    placeholderData: (previousData) => previousData,
  })
}
