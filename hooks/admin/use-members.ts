import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type AdminMember = {
  id: number
  accountId: string
  accountFullName: string
  accountEmail: string
  fullName: string
  dob: string
  gender: "male" | "female" | "any"
  currentLevelName: string | null
  activeEnrollmentCount: number
  archivedAt: string | null
  createdAt: string
}

type AdminMemberRow = {
  id: number
  account_id: string
  account_full_name: string | null
  account_email: string | null
  full_name: string
  dob: string
  gender: "male" | "female" | "any"
  current_level_name: string | null
  active_enrollment_count: number
  archived_at: string | null
  created_at: string
}

function toAdminMember(row: AdminMemberRow): AdminMember {
  return {
    id: row.id,
    accountId: row.account_id,
    accountFullName: row.account_full_name ?? "Unnamed",
    accountEmail: row.account_email ?? "",
    fullName: row.full_name,
    dob: row.dob,
    gender: row.gender,
    currentLevelName: row.current_level_name,
    activeEnrollmentCount: row.active_enrollment_count,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
  }
}

export type UseMembersFilters = {
  search?: string
  /** null = all, false = active only (default), true = archived only */
  archived?: boolean | null
}

export function useMembers({
  search,
  archived = false,
}: UseMembersFilters = {}) {
  const supabase = createClient()
  const normalizedSearch = search?.trim().slice(0, 100) || undefined

  return useQuery({
    queryKey: ["admin-members", normalizedSearch ?? "", archived ?? "all"],
    queryFn: async (): Promise<AdminMember[]> => {
      const { data, error } = await supabase.rpc("admin_get_members", {
        p_member_id: null,
        p_search: normalizedSearch ?? null,
        p_archived: archived,
      })
      if (error) throw error
      return (data as AdminMemberRow[]).map(toAdminMember)
    },
    placeholderData: (previousData) => previousData,
  })
}
