"use client"

import { AlertCircle } from "lucide-react"
import { useInvoices } from "@/hooks/client/use-invoices"
import { InvoiceList } from "@/components/portals/client/invoices/invoice-list"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function PaymentsPage() {
  const { data: invoices, isLoading, error } = useInvoices()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="View your invoices and payment history"
      />

      {isLoading && (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="flex flex-col divide-y divide-border/60">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="ml-auto h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
            strokeWidth={1.75}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Failed to load invoices. Please try again.
          </p>
        </div>
      )}

      {invoices && <InvoiceList invoices={invoices} />}
    </div>
  )
}
