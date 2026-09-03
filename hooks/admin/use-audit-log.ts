// hooks/admin/use-audit-log.ts
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type AuditLogEntry = {
  id: number
  actorId: string | null
  actorName: string
  actorRole: string | null
  action: "insert" | "update" | "delete"
  tableName: string
  recordId: string
  changedFields: string[] | null
  newData: Record<string, unknown> | null
  oldData: Record<string, unknown> | null
  createdAt: string
}

type AuditLogRow = {
  id: number
  actor_id: string | null
  actor_name: string | null
  actor_role: string | null
  action: "insert" | "update" | "delete"
  table_name: string
  record_id: string
  changed_fields: string[] | null
  new_data: Record<string, unknown> | null
  old_data: Record<string, unknown> | null
  created_at: string
}

function toEntry(row: AuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name ?? "System",
    actorRole: row.actor_role,
    action: row.action,
    tableName: row.table_name,
    recordId: row.record_id,
    changedFields: row.changed_fields,
    newData: row.new_data,
    oldData: row.old_data,
    createdAt: row.created_at,
  }
}

export type UseAuditLogFilters = {
  tableName?: string
  actorId?: string
  limit?: number
  offset?: number
}

export function useAuditLog({
  tableName,
  actorId,
  limit = 50,
  offset = 0,
}: UseAuditLogFilters = {}) {
  const supabase = createClient()

  return useQuery({
    queryKey: [
      "admin-audit-log",
      tableName ?? "all",
      actorId ?? "all",
      limit,
      offset,
    ],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      const { data, error } = await supabase.rpc("admin_get_audit_log", {
        p_table_name: tableName ?? null,
        p_actor_id: actorId ?? null,
        p_limit: limit,
        p_offset: offset,
      })
      if (error) throw error
      return (data as AuditLogRow[]).map(toEntry)
    },
    placeholderData: (previousData) => previousData,
  })
}
