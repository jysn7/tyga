"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { Field, fieldStyles } from "@/components/portals/shared/field"
import {
  useUpdateAppSettings,
  type AppSettings,
} from "@/hooks/lookups/use-academy-settings"
import { SaveBar } from "@/components/portals/admin/settings/save-bar"

export function PaymentsTab({ settings }: { settings: AppSettings }) {
  const router = useRouter()
  const update = useUpdateAppSettings()
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const [currency, setCurrency] = useState(settings.currency)
  const [vatEnabled, setVatEnabled] = useState(settings.vatEnabled)
  const [vatRate, setVatRate] = useState(settings.vatRate.toString())
  const [vatNumber, setVatNumber] = useState(settings.vatNumber ?? "")
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix)
  const [invoiceDueDays, setInvoiceDueDays] = useState(
    settings.invoiceDueDays.toString()
  )
  const [bankDetails, setBankDetails] = useState(settings.bankDetails ?? "")

  function handleSave() {
    update.mutate(
      {
        currency,
        vat_enabled: vatEnabled,
        vat_rate: Number(vatRate),
        vat_number: vatNumber || null,
        invoice_prefix: invoicePrefix,
        invoice_due_days: Number(invoiceDueDays),
        bank_details: bankDetails || null,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Payment settings saved",
            type: "success",
            timeout: 4000,
          })
          setSavedAt(Date.now())
          router.refresh()
        },
        onError: (err) =>
          toast.add({
            title: "Save failed",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            VAT
          </h2>
          <p className="text-xs text-muted-foreground">
            Only enable once the academy is VAT-registered with SARS
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <div className="flex items-center justify-between border-b border-border/60 py-3 first:pt-0">
            <div className="flex flex-col gap-0.5 pr-4">
              <span className="text-sm text-foreground">
                Charge VAT on invoices
              </span>
              <span className="text-[11px] text-muted-foreground">
                Off by default. Turn on when registered.
              </span>
            </div>
            <Switch checked={vatEnabled} onCheckedChange={setVatEnabled} />
          </div>

          <Field label="VAT rate (%)">
            <Input
              className={fieldStyles}
              type="number"
              step="0.01"
              min="0"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              disabled={!vatEnabled}
            />
          </Field>

          <Field label="VAT number">
            <Input
              className={fieldStyles}
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              disabled={!vatEnabled}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Invoicing
          </h2>
          <p className="text-xs text-muted-foreground">
            How invoices are numbered and dated
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field label="Currency">
            <Input
              className={fieldStyles}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="ZAR"
            />
          </Field>

          <Field label="Invoice prefix">
            <Input
              className={fieldStyles}
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              placeholder="INV-"
            />
          </Field>

          <Field
            label="Payment due (days)"
            hint="How many days after issue an invoice is due"
          >
            <Input
              className={fieldStyles}
              type="number"
              min="0"
              value={invoiceDueDays}
              onChange={(e) => setInvoiceDueDays(e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Bank details for EFT
          </h2>
          <p className="text-xs text-muted-foreground">
            Shown on every invoice so parents know where to pay
          </p>
        </div>
        <div className="flex flex-col rounded-xl bg-card p-5 shadow">
          <Field label="Bank details">
            <textarea
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              placeholder={
                "Bank: FNB\nAccount: 62012345678\nBranch: 250655\nReference: your surname"
              }
              className="min-h-32 w-full resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5 rounded-xl bg-card p-5 shadow">
          <span className="text-sm font-medium text-foreground">
            Payment gateway
          </span>
          <span className="text-xs text-muted-foreground">
            Paystack is configured through environment variables. Keys are
            managed in deployment settings, not here.
          </span>
        </div>
      </section>

      <SaveBar
        onSave={handleSave}
        isSaving={update.isPending}
        savedAt={savedAt}
      />
    </div>
  )
}
