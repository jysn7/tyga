import type { Invoice } from "@/components/portals/client/invoices/invoice-row"

export const sampleInvoices: Invoice[] = [
  {
    id: "1001",
    description: "Skill Building — Weekday Squad (Jayden)",
    issuedAt: "2026-07-01",
    dueAt: "2026-07-08",
    totalAmount: 1200,
    status: "paid",
  },
  {
    id: "1002",
    description: "Holiday Camp — July (Jayden)",
    issuedAt: "2026-07-20",
    dueAt: "2026-07-27",
    totalAmount: 650,
    status: "pending",
  },
  {
    id: "1003",
    description: "Foundation — Tuesday & Thursday (Lerato)",
    issuedAt: "2026-06-15",
    dueAt: "2026-06-22",
    totalAmount: 850,
    status: "overdue",
  },
]
