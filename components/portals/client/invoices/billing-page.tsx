"use client"

import { MembershipCard } from "@/components/portals/client/invoices/membership-card"
import { InvoicesTab } from "./invoices-tab"
import { SummaryCards } from "./summary-cards"

export function BillingPage({
  membershipStatus,
  membershipCurrentPeriodEnd,
}: {
  membershipStatus:
    "pending" | "active" | "non_renewing" | "cancelled" | "attention" | null
  membershipCurrentPeriodEnd: string | null
}) {
  return (
    <div className="flex flex-col gap-6">
      <MembershipCard
        status={membershipStatus}
        currentPeriodEnd={membershipCurrentPeriodEnd}
      />
      <SummaryCards />
      <InvoicesTab />
    </div>
  )
}
