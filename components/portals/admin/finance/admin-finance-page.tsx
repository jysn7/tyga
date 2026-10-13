// components/portals/admin/finance/admin-finance-page.tsx

"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useFinanceOverview } from "@/hooks/admin/use-admin-finance"
import { FinanceOverviewTab } from "./finance-overview"
import { InvoicesTab } from "./invoices-tab"
import { PaymentsTab } from "./payments-tab"
import { RefundsTab } from "./refunds-tab"
import { MembershipsTab } from "./memberships-tab"
import { InvoiceSheet } from "./invoice-sheet"

type TabKey = "overview" | "invoices" | "payments" | "refunds" | "memberships"

/**
 * Admin finance dashboard with overview, invoices, payments, refunds, and memberships.
 * The selected tab is preserved from the URL query so anchor links can open an
 * exact finance section directly.
 */
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "invoices", label: "Invoices" },
  { key: "payments", label: "Payments" },
  { key: "refunds", label: "Refunds" },
  { key: "memberships", label: "Memberships" },
]

export function AdminFinancePage() {
  const sp = useSearchParams()
  const initialInvoice = Number(sp.get("invoice")) || null
  const initialTab =
    (sp.get("tab") as TabKey | null) ??
    (initialInvoice ? "invoices" : "overview")

  const [tab, setTab] = useState<TabKey>(
    TABS.some((t) => t.key === initialTab) ? initialTab : "overview"
  )
  const [invoiceId, setInvoiceId] = useState<number | null>(initialInvoice)
  const { data: overview } = useFinanceOverview()

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as TabKey)}
      className="flex flex-col gap-6"
    >
      <TabsList className="w-fit">
        {TABS.map((t) => (
          <TabsTrigger
            key={t.key}
            value={t.key}
            className="flex items-center gap-1.5"
          >
            {t.label}
            {t.key === "refunds" && !!overview?.refund_reviews && (
              <span className="rounded-full bg-rose px-1.5 py-0.5 text-[10px] text-orange-foreground">
                {overview.refund_reviews}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        <FinanceOverviewTab goTo={setTab} />
      </TabsContent>

      <TabsContent value="invoices" className="mt-0">
        <InvoicesTab onOpen={setInvoiceId} />
      </TabsContent>

      <TabsContent value="payments" className="mt-0">
        <PaymentsTab onOpenInvoice={setInvoiceId} />
      </TabsContent>

      <TabsContent value="refunds" className="mt-0">
        <RefundsTab />
      </TabsContent>

      <TabsContent value="memberships" className="mt-0">
        <MembershipsTab />
      </TabsContent>

      <InvoiceSheet
        id={invoiceId}
        onClose={() => setInvoiceId(null)}
        onOpenRefunds={() => setTab("refunds")}
      />
    </Tabs>
  )
}
