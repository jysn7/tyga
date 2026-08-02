import { PageHeader } from "@/components/portals/shared/page-header"
import { InvoiceList } from "@/components/portals/client/invoices/invoice-list"
import { sampleInvoices } from "@/components/portals/client/invoices/invoices-sample-data"

export default function InvoicesPage() {
  const invoices = sampleInvoices

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="View and pay invoices for programmes, gear, and events"
      />
      <InvoiceList invoices={invoices} />
    </div>
  )
}
