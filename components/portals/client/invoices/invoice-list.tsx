import {
  InvoiceRow,
  type Invoice,
} from "@/components/portals/client/invoices/invoice-row"
import { EmptyState } from "@/components/portals/shared/empty-state"

export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No invoices yet"
        description="Invoices will appear here once you enroll in a programme."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
            <th className="px-4 py-2.5 font-medium">Description</th>
            <th className="px-4 py-2.5 font-medium">Issued</th>
            <th className="px-4 py-2.5 font-medium">Due</th>
            <th className="px-4 py-2.5 font-medium">Amount</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
