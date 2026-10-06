"use client"

import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, Receipt } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import type { Invoice } from "@/lib/types"

const STATUS_MAP: Record<
  Invoice["status"],
  { label: string; variant: StatusVariant }
> = {
  pending: { label: "Pending", variant: "warning" },
  partially_paid: { label: "Partially paid", variant: "info" },
  paid: { label: "Paid", variant: "success" },
  overdue: { label: "Overdue", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "neutral" },
}

export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No invoices yet"
        description="When you enrol in a programme, invoices will appear here."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg bg-card shadow">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 bg-foreground/80 py-1 text-card">
            <TableHead className="h-9 text-xs font-medium tracking-wide text-secondary uppercase">
              Invoice
            </TableHead>
            <TableHead className="h-9 text-xs font-medium tracking-wide text-secondary uppercase">
              Issued
            </TableHead>
            <TableHead className="h-9 text-xs font-medium tracking-wide text-secondary uppercase">
              Due
            </TableHead>
            <TableHead className="h-9 text-xs font-medium tracking-wide text-secondary uppercase">
              Amount
            </TableHead>
            <TableHead className="h-9 text-xs font-medium tracking-wide text-secondary uppercase">
              Status
            </TableHead>
            <TableHead className="h-9 w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const status = STATUS_MAP[invoice.status] ?? {
              label: invoice.status,
              variant: "neutral" as const,
            }

            return (
              <TableRow
                key={invoice.id}
                className="group border-border/60 transition-colors hover:bg-accent/40"
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-input">
                      <Receipt
                        className="h-3.5 w-3.5 text-muted-foreground"
                        strokeWidth={1.75}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      #{invoice.id.toString().padStart(5, "0")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(invoice.issuedAt), "d MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(invoice.dueAt), "d MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-sm font-medium tracking-tight text-foreground">
                    R{invoice.totalAmount.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <StatusPill label={status.label} variant={status.variant} />
                </TableCell>
                <TableCell className="py-3 text-right">
                  <Link
                    href={`/billing/invoices/${invoice.id}`}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    View
                    <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
