import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/portals/shared/status-pill"

export type Invoice = {
  id: string
  description: string
  issuedAt: string
  dueAt: string
  totalAmount: number
  status: "pending" | "paid" | "partially_paid" | "overdue" | "cancelled"
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const needsPayment =
    invoice.status === "pending" || invoice.status === "overdue"

  return (
    <tr className="border-b border-border/60 text-xs last:border-b-0 hover:bg-accent/40">
      <td className="px-4 py-3">
        <p className="font-medium text-muted-foreground">
          {invoice.description}
        </p>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {formatDate(invoice.issuedAt)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {formatDate(invoice.dueAt)}
      </td>
      <td className="px-4 py-3 font-medium whitespace-nowrap text-muted-foreground">
        R{invoice.totalAmount.toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <StatusPill label={invoice.status} />
      </td>
      <td className="px-4 py-3 text-right">
        {needsPayment && (
          <Button
            size="sm"
            variant="secondary"
            className="h-7 cursor-pointer rounded-md px-3 text-xs font-medium hover:bg-primary"
          >
            Pay now
          </Button>
        )}
      </td>
    </tr>
  )
}
