"use client"

import { PageHeader } from "@/components/portals/shared/page-header"
import { BillingPage } from "@/components/portals/client/invoices/billing-page"
import { useMyAccount } from "@/hooks/client/use-my-account"

export default function BillingRoute() {
  const { data } = useMyAccount()

  return (
    <div className="mx-auto flex flex-col gap-6">
      <PageHeader
        title="Billing"
        description="Your membership, invoices, and payments"
      />
      <BillingPage
        membershipStatus={data?.membership_status ?? null}
        membershipCurrentPeriodEnd={data?.membership_current_period_end ?? null}
      />
    </div>
  )
}
