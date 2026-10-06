"use client"

import Link from "next/link"
import { use } from "react"
import { format } from "date-fns"
import { ArrowLeft, Download, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import { useInvoiceDetail } from "@/hooks/client/use-invoices"
import { downloadInvoicePdf } from "@/components/portals/client/invoices/invoice-pdf"
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

const PAYMENT_STATUS_MAP: Record<
  string,
  { label: string; variant: StatusVariant }
> = {
  pending: { label: "Pending", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  refunded: { label: "Refunded", variant: "info" },
}

function formatRand(amount: number) {
  return `R${amount.toFixed(2)}`
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const invoiceId = Number(id)

  const { data: invoice, isLoading, error } = useInvoiceDetail(invoiceId)

  const invoiceNumber = String(invoiceId).padStart(5, "0")

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/billing"
          className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to billing
        </Link>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <p className="text-sm text-muted-foreground">
            Invoice not found or you don&apos;t have access to it.
          </p>
        </div>
      </div>
    )
  }

  const status = STATUS_MAP[invoice.status] ?? {
    label: invoice.status,
    variant: "neutral" as const,
  }

  const balance = invoice.outstandingAmount
  const isFullyPaid = balance <= 0

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/billing"
        className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Back to billing
      </Link>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* LEFT — invoice */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Header */}
          <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  Invoice #{invoiceNumber}
                </h1>
                <StatusPill label={status.label} variant={status.variant} />
              </div>
              <p className="text-xs text-muted-foreground">
                Issued {format(new Date(invoice.issuedAt), "d MMM yyyy")} · Due{" "}
                {format(new Date(invoice.dueAt), "d MMM yyyy")}
              </p>
            </div>

            <Button
              size="sm"
              variant="secondary"
              className="h-9 shrink-0 rounded-md text-xs"
              onClick={() => downloadInvoicePdf({ invoice, invoiceNumber })}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
              Download PDF
            </Button>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TotalCard label="Total" value={formatRand(invoice.totalAmount)} />
            <TotalCard label="Paid" value={formatRand(invoice.paidAmount)} />
            <TotalCard
              label="Balance"
              value={formatRand(balance)}
              valueClassName={isFullyPaid ? "text-green" : "text-orange"}
            />
          </div>

          {/* Line items */}
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Line items
            </h2>
            <div className="overflow-hidden rounded-lg bg-card shadow">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 text-card">
                    <TableHead className="h-9 text-xs font-medium tracking-wide text-secondary uppercase">
                      Description
                    </TableHead>
                    <TableHead className="h-9 text-xs font-medium tracking-wide text-secondary uppercase">
                      Type
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-medium tracking-wide text-secondary uppercase">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((li) => (
                    <TableRow key={li.id} className="border-border/60">
                      <TableCell className="py-3">
                        <span className="text-sm text-foreground">
                          {li.description}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs text-muted-foreground capitalize">
                          {li.itemType.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm font-medium tracking-tight text-foreground">
                          {formatRand(li.amount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>

        {/* RIGHT — payments */}
        <section className="flex flex-col gap-3 lg:col-span-1">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Payments
          </h2>

          {invoice.payments.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-5">
              <Receipt
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <p className="text-xs text-muted-foreground">
                No payments recorded against this invoice yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow">
              {invoice.payments.map((p) => {
                const pStatus = PAYMENT_STATUS_MAP[p.status ?? "pending"] ?? {
                  label: p.status ?? "Pending",
                  variant: "neutral" as const,
                }

                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-2 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium tracking-tight text-foreground">
                        {formatRand(p.amount)}
                      </span>
                      <StatusPill
                        label={pStatus.label}
                        variant={pStatus.variant}
                      />
                    </div>

                    <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                      <span>
                        {p.paidAt
                          ? format(new Date(p.paidAt), "d MMM yyyy")
                          : "—"}
                        {p.method ? ` · ${p.method}` : ""}
                      </span>
                      {p.gatewayReference && (
                        <span className="truncate">
                          Ref {p.gatewayReference}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function TotalCard({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-card p-4 shadow">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className={`text-lg font-semibold tracking-tight ${valueClassName ?? "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  )
}
