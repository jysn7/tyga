// components/portals/admin/finance/invoice-sheet.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { AlertTriangle } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { Field } from "@/components/portals/shared/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useAdminInvoiceDetail,
  useRecordManualPayment,
  type ManualMethod,
} from "@/hooks/admin/use-admin-finance"
import { InvoiceBadge, PaymentBadge } from "./finance-badges"

const ENROLMENTS_ROUTE = "/admin/enrollments"

const money = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
      }).format(n)

const fmtDate = (s: string | null | undefined) =>
  s ? format(parseISO(s), "d MMM yyyy") : "—"
const fmtDateTime = (s: string | null | undefined) =>
  s ? format(parseISO(s), "d MMM yyyy, HH:mm") : "—"

const todaySast = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" })

interface InvoiceSheetProps {
  id: number | null
  onClose: () => void
  onOpenRefunds: () => void
}

export function InvoiceSheet({
  id,
  onClose,
  onOpenRefunds,
}: InvoiceSheetProps) {
  const { data, isLoading, error } = useAdminInvoiceDetail(id)
  const record = useRecordManualPayment()
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<ManualMethod>("eft")
  const [reference, setReference] = useState("")
  const [paidOn, setPaidOn] = useState(todaySast())
  const [note, setNote] = useState("")

  const resetForm = () => {
    setOpen(false)
    setMethod("eft")
    setReference("")
    setPaidOn(todaySast())
    setNote("")
    record.reset()
  }

  function submit() {
    if (!id) return
    record.mutate(
      { invoiceId: id, method, reference, paidOn, note },
      { onSuccess: () => resetForm() }
    )
  }

  return (
    <SidePanel
      open={id !== null}
      onOpenChange={(o) => {
        if (!o) {
          onClose()
          resetForm()
        }
      }}
      title={data ? `Invoice #${data.invoice_id}` : "Invoice"}
      header={
        <div className="flex flex-col gap-1 px-8 pt-8 pb-4">
          <span className="text-xl font-semibold tracking-tight text-foreground">
            {data ? `Invoice #${data.invoice_id}` : "Invoice"}
          </span>
          <span className="text-sm text-muted-foreground">
            {data ? money(data.total_amount) : "Loading details..."}
          </span>
        </div>
      }
    >
      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <Loader />
        </div>
      )}

      {error && (
        <div className="m-4 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error.message}
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-5 px-6 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <InvoiceBadge status={data.display_status} />
            <span className="text-xs text-muted-foreground">
              Issued {fmtDate(data.issued_at)} · due {fmtDate(data.due_at)}
            </span>
          </div>

          {data.refund_review && (
            <div className="flex flex-col gap-2 rounded-xl bg-orange-light p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangle className="h-4 w-4 stroke-[1.75]" />
                Refund decision needed
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="self-start text-xs"
                onClick={() => {
                  onClose()
                  onOpenRefunds()
                }}
              >
                Open refunds
              </Button>
            </div>
          )}

          <div className="flex w-full flex-col gap-3 md:flex-row">
            <div className="w-full rounded-xl bg-card p-3 shadow">
              <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                Parent
              </p>
              <p className="mt-1 text-sm text-foreground">
                {data.account.full_name ?? "—"}
              </p>
              {data.account.email && (
                <p className="text-xs text-muted-foreground">
                  {data.account.email}
                </p>
              )}
              {data.account.phone && (
                <p className="text-xs text-muted-foreground">
                  {data.account.phone}
                </p>
              )}
            </div>
            <div className="w-full rounded-xl bg-card p-3 shadow">
              <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                For
              </p>
              {data.enrollment ? (
                <>
                  <p className="mt-1 text-sm text-foreground">
                    {data.enrollment.member_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.enrollment.programme_name}
                  </p>
                  <Link
                    href={`${ENROLMENTS_ROUTE}?enrollment=${data.enrollment.id}`}
                    className="mt-1 inline-block text-xs text-information underline"
                  >
                    View enrolment
                  </Link>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Not linked to an enrolment
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Line items
            </h3>
            {data.line_items.map((li) => (
              <div key={li.id} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {li.description ?? li.item_type}
                </span>
                <span className="text-muted-foreground">
                  {money(li.amount)}
                </span>
              </div>
            ))}
          </div>

          {data.allowed_actions.includes("record_payment") && !open && (
            <Button
              size="sm"
              variant="secondary"
              className="self-start"
              onClick={() => {
                setOpen(true)
                setMethod("eft")
                setReference("")
                setPaidOn(todaySast())
                setNote("")
                record.reset()
              }}
            >
              Record payment
            </Button>
          )}

          {open && (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">
                Record payment
              </p>
              <p className="text-xs text-muted-foreground">
                Records the full {money(data.total_amount)} as received. The
                invoice is marked paid
                {data.enrollment?.status === "pending"
                  ? " and the enrolment is activated."
                  : "."}
              </p>

              <Select
                value={method}
                onValueChange={(v) => setMethod((v as ManualMethod) ?? "eft")}
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue>
                    {
                      {
                        eft: "EFT / bank transfer",
                        cash: "Cash",
                        other: "Other",
                      }[method]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eft">EFT / bank transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Field label="Bank reference (optional)">
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  maxLength={60}
                  className="h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </Field>

              <Field label="Date received">
                <input
                  type="date"
                  value={paidOn}
                  max={todaySast()}
                  onChange={(e) => setPaidOn(e.target.value)}
                  className="h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </Field>

              <Field label="Note (optional)">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  maxLength={300}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </Field>

              {record.error && (
                <p className="text-xs text-destructive">
                  {record.error.message}
                </p>
              )}
              {record.data && record.data.applied === false && (
                <p className="text-xs text-destructive">
                  Not applied: {record.data.reason}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={record.isPending || !paidOn}
                  onClick={submit}
                >
                  {record.isPending ? "Saving..." : "Confirm payment"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={record.isPending}
                  onClick={() => setOpen(false)}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Payments
            </h3>
            {data.payments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No payments yet.</p>
            ) : (
              data.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-0.5 rounded-lg border border-border/60 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">
                      {money(p.amount)}
                    </span>
                    <PaymentBadge status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[p.method, p.channel].filter(Boolean).join(" · ") || "—"} ·{" "}
                    {fmtDateTime(p.paid_at)}
                  </p>
                  {p.gateway_reference && (
                    <p className="text-[11px] break-all text-muted-foreground">
                      Ref {p.gateway_reference}
                    </p>
                  )}
                  {p.recorded_by && (
                    <p className="text-[11px] text-muted-foreground">
                      Recorded by {p.recorded_by}
                    </p>
                  )}
                  {p.note && (
                    <p className="text-[11px] text-muted-foreground">
                      “{p.note}”
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </SidePanel>
  )
}
