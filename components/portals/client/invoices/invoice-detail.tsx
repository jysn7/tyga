"use client"

import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeft,
  Download,
  Receipt,
  CreditCard,
  CheckCircle2,
} from "lucide-react"
import type { InvoiceDetail as InvoiceDetailType } from "@/lib/types"

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

export function InvoiceDetail({ invoice }: { invoice: InvoiceDetailType }) {
  const canPay =
    invoice.status === "pending" ||
    invoice.status === "partially_paid" ||
    invoice.status === "overdue"

  const invoiceNumber = `#${invoice.id.toString().padStart(5, "0")}`

  return (
    <div className="mx-auto max-w-5xl py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href="/invoices"
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Invoices
        </Link>
        <span>/</span>
        <span className="text-foreground">{invoiceNumber}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Hero header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {invoiceNumber}
                  </h1>
                  <span
                    className={`text-xs font-medium ${
                      statusStyles[invoice.status] ?? "text-muted-foreground"
                    }`}
                  >
                    {statusLabels[invoice.status] ?? invoice.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Issued {format(new Date(invoice.issuedAt), "d MMM yyyy")} ·
                  Due {format(new Date(invoice.dueAt), "d MMM yyyy")}
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-card px-3 text-xs font-medium text-foreground shadow transition-colors hover:bg-accent"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>

          {/* Line items card */}
          <section className="overflow-hidden rounded-xl bg-card shadow">
            <div className="flex items-center gap-2.5 border-b border-border/60 px-6 py-4">
              <Receipt
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={1.75}
              />
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Line items
              </h2>
            </div>

            <div className="flex flex-col divide-y divide-border/60">
              {invoice.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-6 px-6 py-4"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {item.description}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.itemType.replace("_", " ")}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-medium tracking-tight text-foreground">
                    R{item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Payment history */}
          {invoice.payments.length > 0 && (
            <section className="overflow-hidden rounded-xl bg-card shadow">
              <div className="flex items-center gap-2.5 border-b border-border/60 px-6 py-4">
                <CreditCard
                  className="h-3.5 w-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Payment history
                </h2>
              </div>

              <div className="flex flex-col divide-y divide-border/60">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-input">
                        {payment.status === "paid" ? (
                          <CheckCircle2
                            className="h-3.5 w-3.5 text-primary"
                            strokeWidth={1.75}
                          />
                        ) : (
                          <CreditCard
                            className="h-3.5 w-3.5 text-muted-foreground"
                            strokeWidth={1.75}
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          R{payment.amount.toFixed(2)} · {payment.method}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {payment.paidAt
                            ? format(
                                new Date(payment.paidAt),
                                "d MMM yyyy, HH:mm"
                              )
                            : payment.status}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium ${
                        payment.status === "paid"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 flex flex-col gap-5 rounded-xl bg-card p-6 shadow">
            {/* Amount due */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {canPay ? "Amount due" : "Total"}
              </span>
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                R
                {canPay
                  ? invoice.outstandingAmount.toFixed(2)
                  : invoice.totalAmount.toFixed(2)}
              </span>
            </div>

            {canPay && (
              <button
                type="button"
                onClick={() => {
                  // TODO: Call Paystack initialization
                }}
                className="h-11 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Pay now
              </button>
            )}

            <div className="h-px bg-border/60" />

            {/* Summary */}
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-foreground">
                  R{invoice.totalAmount.toFixed(2)}
                </span>
              </div>
              {invoice.paidAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="text-primary">
                    −R{invoice.paidAmount.toFixed(2)}
                  </span>
                </div>
              )}
              {invoice.outstandingAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Outstanding</span>
                  <span className="font-medium text-foreground">
                    R{invoice.outstandingAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="h-px bg-border/60" />

            {/* Dates */}
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Issued</span>
                <span className="text-foreground">
                  {format(new Date(invoice.issuedAt), "d MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Due</span>
                <span className="text-foreground">
                  {format(new Date(invoice.dueAt), "d MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={
                    statusStyles[invoice.status] ?? "text-muted-foreground"
                  }
                >
                  {statusLabels[invoice.status] ?? invoice.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
