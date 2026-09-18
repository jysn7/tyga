"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { OutstandingInvoice } from "@/hooks/client/use-parent-overview"

export function OutstandingInvoiceBanner({
  invoices,
}: {
  invoices: OutstandingInvoice[]
}) {
  if (invoices.length === 0) return null

  const first = invoices[0]

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange/10">
        <AlertCircle className="h-5 w-5 text-orange" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          You have {invoices.length} outstanding invoice
          {invoices.length > 1 ? "s" : ""}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {first.description} · R{first.amount.toLocaleString()} due {first.due}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 gap-1.5 rounded-lg text-xs"
      >
        <Link href="/invoices">Pay now</Link>
      </Button>
    </div>
  )
}
