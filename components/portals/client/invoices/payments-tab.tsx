"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusPill } from "@/components/portals/shared/status-pill"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePayments, type Payment } from "@/hooks/client/use-invoices"

// Maps your DB payment status to a StatusPill variant label
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  successful: "Paid",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
}

function mapStatusLabel(status: string | null): string {
  if (!status) return "Pending"
  return STATUS_LABELS[status] ?? status
}

function formatRand(amount: number) {
  return `R${amount.toFixed(2)}`
}

export function PaymentsTab() {
  const [status, setStatus] = useState<string>("all")
  const [method, setMethod] = useState<string>("all")

  const {
    data: payments,
    isLoading,
    error,
  } = usePayments({
    status:
      status === "all"
        ? null
        : (status as "pending" | "successful" | "failed" | "refunded"),
    method:
      method === "all"
        ? null
        : (method as "card" | "eft" | "cash" | "debit_order" | "other"),
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="h-9 w-full text-sm sm:w-40">
            <SelectValue placeholder="All statuses">
              {status === "all"
                ? "All statuses"
                : (STATUS_LABELS[status] ?? status)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="successful">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select value={method} onValueChange={(v) => setMethod(v ?? "all")}>
          <SelectTrigger className="h-9 w-full text-sm sm:w-40">
            <SelectValue placeholder="All methods">
              {method === "all"
                ? "All methods"
                : method.charAt(0).toUpperCase() + method.slice(1)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="eft">EFT</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="debit_order">Debit order</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="overflow-hidden rounded-lg bg-card shadow">
          <div className="flex flex-col divide-y divide-border/60">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="ml-auto h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <Receipt
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
            strokeWidth={1.75}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Failed to load payments. Please try again.
          </p>
        </div>
      )}

      {/* Empty */}
      {payments && payments.length === 0 && (
        <EmptyState
          title="No payments yet"
          description="Payments appear here once invoices are settled."
        />
      )}

      {/* Table */}
      {payments && payments.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-card shadow">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-foreground/80 py-1 text-card hover:bg-transparent">
                <TableHead className="h-11 text-xs font-medium tracking-wide text-secondary uppercase">
                  Date
                </TableHead>
                <TableHead className="h-11 text-xs font-medium tracking-wide text-secondary uppercase">
                  Method
                </TableHead>
                <TableHead className="h-11 text-xs font-medium tracking-wide text-secondary uppercase">
                  Reference
                </TableHead>
                <TableHead className="h-11 text-xs font-medium tracking-wide text-secondary uppercase">
                  Amount
                </TableHead>
                <TableHead className="h-11 text-xs font-medium tracking-wide text-secondary uppercase">
                  Status
                </TableHead>
                <TableHead className="h-11 w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <PaymentRow key={p.id} payment={p} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// ---------- Row ----------

function PaymentRow({ payment }: { payment: Payment }) {
  const isSuccess = payment.status === "successful" || payment.status === "paid"
  const ref = payment.gatewayReference

  return (
    <TableRow className="group border-border/60 transition-colors hover:bg-accent/40">
      <TableCell className="py-3">
        <span className="text-xs text-muted-foreground">
          {payment.paidAt
            ? format(new Date(payment.paidAt), "d MMM yyyy")
            : "—"}
        </span>
      </TableCell>

      <TableCell className="py-3">
        <span className="text-xs text-muted-foreground capitalize">
          {payment.method ?? "—"}
          {payment.channel ? ` · ${payment.channel}` : ""}
        </span>
      </TableCell>

      <TableCell className="py-3">
        <span className="truncate text-xs text-muted-foreground">
          {ref ?? "—"}
        </span>
      </TableCell>

      <TableCell className="py-3">
        <span className="text-sm font-medium tracking-tight text-foreground">
          {formatRand(payment.amount)}
        </span>
      </TableCell>

      <TableCell className="py-3">
        <StatusPill label={mapStatusLabel(payment.status)} />
      </TableCell>

      <TableCell className="py-3 text-right">
        {isSuccess && (
          <Button
            size="sm"
            variant="secondary"
            className="h-7 cursor-pointer rounded-md px-3 text-xs font-medium hover:bg-primary"
          >
            Receipt
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
