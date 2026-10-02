"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoicesTab } from "./invoices-tab"
import { PaymentsTab } from "./payments-tab"

export function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* <SummaryCards /> */}

      <Tabs defaultValue="invoices" className="flex flex-col gap-5">
        <TabsList className="w-fit">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-0">
          <InvoicesTab />
        </TabsContent>

        <TabsContent value="payments" className="mt-0">
          <PaymentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
