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
import type { Invoice } from "@/lib/types"

const statusStyles: Record<string, string> = {
  pending: "text-orange",
  paid: "text-primary",
  partially_paid: "text-foreground",
  overdue: "text-destructive",
  cancelled: "text-muted-foreground",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  partially_paid: "Partially Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
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
    <div className="overflow-hidden rounded-xl bg-card shadow">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="h-11 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Invoice
            </TableHead>
            <TableHead className="h-11 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Issued
            </TableHead>
            <TableHead className="h-11 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Due
            </TableHead>
            <TableHead className="h-11 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Amount
            </TableHead>
            <TableHead className="h-11 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Status
            </TableHead>
            <TableHead className="h-11 w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
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
                <span
                  className={`text-xs font-medium ${statusStyles[invoice.status] ?? "text-muted-foreground"}`}
                >
                  {statusLabels[invoice.status] ?? invoice.status}
                </span>
              </TableCell>
              <TableCell className="py-3 text-right">
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  View
                  <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
