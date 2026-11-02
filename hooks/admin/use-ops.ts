import { useMutation, useQuery } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"

export type HealthCheck = {
  code: string
  label: string
  severity: "high" | "medium" | "low"
  count: number | null
}
export type HealthJob = {
  job: string
  started_at: string
  finished_at: string | null
  ok: boolean | null
  detail: string | null
}
export type SystemHealth = {
  checked_at: string
  checks: HealthCheck[]
  jobs: HealthJob[]
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: async (): Promise<SystemHealth> => {
      const { data, error } = await createClient().rpc(
        "admin_get_system_health"
      )
      if (error) throw new Error(error.message)
      return data as SystemHealth
    },
    staleTime: 0,
  })
}

// ---------- CSV ----------
function cell(v: unknown): string {
  if (v === null || v === undefined) return ""
  let s = typeof v === "object" ? JSON.stringify(v) : String(v)
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = "'" + s // stops spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const headers = rows.length ? Object.keys(rows[0]) : []
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => cell(r[h])).join(",")),
  ]
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  }) // BOM so Excel reads UTF-8
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export type ExportKind = "members" | "enrolments" | "attendance" | "payments"

export function useAdminExport() {
  return useMutation({
    mutationFn: async (input: {
      kind: ExportKind
      from?: string | null
      to?: string | null
    }) => {
      const { data, error } = await createClient().rpc("admin_export", {
        p_kind: input.kind,
        p_from: input.from || null,
        p_to: input.to || null,
      })
      if (error) throw new Error(error.message)
      const rows = (data ?? []) as Record<string, unknown>[]
      const stamp = new Date().toLocaleDateString("en-CA", {
        timeZone: "Africa/Johannesburg",
      })
      downloadCsv(`tyga-${input.kind}-${stamp}.csv`, rows)
      return rows.length
    },
  })
}
