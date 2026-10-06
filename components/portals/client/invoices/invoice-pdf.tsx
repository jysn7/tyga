// components/portals/client/billing/invoice-pdf.tsx
"use client"

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer"
import { format } from "date-fns"
import type { InvoiceDetail } from "@/lib/types"

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#111" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brand: { fontSize: 18, fontWeight: 700 },
  meta: { fontSize: 9, color: "#666", textAlign: "right" },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#666",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    paddingVertical: 6,
  },
  cellLeft: { flex: 3 },
  cellRight: { flex: 1, textAlign: "right" },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 3,
  },
  totalsLabel: { width: 120, textAlign: "right", color: "#666" },
  totalsValue: { width: 90, textAlign: "right", fontWeight: 700 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
})

function formatRand(n: number) {
  return `R${n.toFixed(2)}`
}

export function InvoiceDocument({
  invoice,
  invoiceNumber,
}: {
  invoice: InvoiceDetail
  invoiceNumber: string
}) {
  const paid = invoice.paidAmount
  const balance = invoice.outstandingAmount

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>TYGA</Text>
            <Text style={{ fontSize: 9, color: "#666" }}>Tax invoice</Text>
          </View>
          <View style={styles.meta}>
            <Text>Invoice {invoiceNumber}</Text>
            <Text>
              Issued {format(new Date(invoice.issuedAt), "d MMM yyyy")}
            </Text>
            <Text>Due {format(new Date(invoice.dueAt), "d MMM yyyy")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line items</Text>
          {invoice.lineItems.map((li) => (
            <View key={li.id} style={styles.row}>
              <Text style={styles.cellLeft}>{li.description}</Text>
              <Text style={styles.cellRight}>{formatRand(li.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total</Text>
            <Text style={styles.totalsValue}>
              {formatRand(invoice.totalAmount)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Paid</Text>
            <Text style={styles.totalsValue}>{formatRand(paid)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Balance</Text>
            <Text style={styles.totalsValue}>{formatRand(balance)}</Text>
          </View>
        </View>

        {invoice.payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payments</Text>
            {invoice.payments.map((p) => (
              <View key={p.id} style={styles.row}>
                <Text style={styles.cellLeft}>
                  {p.paidAt ? format(new Date(p.paidAt), "d MMM yyyy") : "—"}
                  {p.method ? ` · ${p.method}` : ""}
                  {p.gatewayReference ? ` · ${p.gatewayReference}` : ""}
                </Text>
                <Text style={styles.cellRight}>{formatRand(p.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Thank you for your payment. Questions? Contact TYGA.
        </Text>
      </Page>
    </Document>
  )
}

export async function downloadInvoicePdf({
  invoice,
  invoiceNumber,
}: {
  invoice: InvoiceDetail
  invoiceNumber: string
}) {
  const blob = await pdf(
    <InvoiceDocument invoice={invoice} invoiceNumber={invoiceNumber} />
  ).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `invoice-${invoiceNumber}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
