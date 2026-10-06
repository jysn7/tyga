"use client"

import { InvoicesTab } from "./invoices-tab"
import { SummaryCards } from "./summary-cards"

export function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <SummaryCards />
      <InvoicesTab />
    </div>
  )
}
