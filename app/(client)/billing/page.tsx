"use client"

import { PageHeader } from "@/components/portals/shared/page-header"
import { BillingPage } from "@/components/portals/client/invoices/billing-page"

export default function BillingRoute() {
  return (
    <div className="mx-auto flex flex-col gap-6">
      <PageHeader
        title="Billing"
        description="Your invoices and payment history"
      />
      <BillingPage />
    </div>
  )
}
