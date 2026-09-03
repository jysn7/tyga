import { format } from "date-fns"

export const ACTION_DOT: Record<string, string> = {
  insert: "bg-primary",
  update: "bg-blue",
  delete: "bg-destructive",
}

export const ACTION_LABELS: Record<string, string> = {
  insert: "Created",
  update: "Updated",
  delete: "Deleted",
}

export const TABLE_LABELS: Record<string, string> = {
  accounts: "Accounts",
  members: "Members",
  coaches: "Coaches",
  programmes: "Programmes",
  enrollments: "Enrollments",
  invoices: "Invoices",
  payments: "Payments",
  level_progressions: "Level Progressions",
}

export const TABLE_OPTIONS = [
  { value: "all", label: "All tables" },
  { value: "accounts", label: "Accounts" },
  { value: "members", label: "Members" },
  { value: "coaches", label: "Coaches" },
  { value: "programmes", label: "Programmes" },
  { value: "enrollments", label: "Enrollments" },
  { value: "invoices", label: "Invoices" },
  { value: "payments", label: "Payments" },
  { value: "level_progressions", label: "Level Progressions" },
]

export const PAGE_SIZE_OPTIONS = ["20", "50", "100"]

export function formatAuditTimestamp(timestamp: string) {
  return format(new Date(timestamp), "MMM d, yyyy HH:mm:ss")
}
