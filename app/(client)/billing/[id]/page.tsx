"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { InvoiceDetail } from "@/components/portals/client/invoices/invoice-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { useInvoiceDetail } from "@/hooks/client/use-invoices"

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = Number(params.id)

  const { data: invoice, isLoading, error } = useInvoiceDetail(invoiceId)

  if (isLoading) {
    return (
      <div className="mx-auto flex flex-col gap-6 py-8">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6 py-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-8 text-center shadow">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle
              className="h-5 w-5 text-destructive"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Invoice not available
            </h1>
            <p className="text-xs text-muted-foreground">
              This invoice doesn&apos;t exist or you don&apos;t have access to
              it.
            </p>
          </div>
          <Link
            href="/invoices"
            className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-input px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            Back to invoices
          </Link>
        </div>
      </div>
    )
  }

  return <InvoiceDetail invoice={invoice} />
}
