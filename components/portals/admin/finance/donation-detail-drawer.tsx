"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { CheckCircle2, Loader2, Receipt, Undo2, User } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { Field } from "@/components/portals/shared/field"
import {
  useAdminDonationDetail,
  useMarkReceiptIssued,
  useRecordDonationRefund,
} from "@/hooks/admin/use-admin-donations"
import { toast } from "@/components/ui/toast"

const fmtDate = (s: string | null) =>
  s ? format(parseISO(s), "d MMM yyyy, HH:mm") : "—"

const fmtMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
  }).format(amount)

const STATUS_TONE: Record<string, string> = {
  success: "bg-green-light text-foreground",
  pending: "bg-blue-light text-foreground",
  failed: "bg-red-light text-foreground",
  abandoned: "bg-muted text-muted-foreground",
  refunded: "bg-orange-light text-foreground",
}

export function DonationDetailDrawer({
  donationId,
  onClose,
}: {
  donationId: number | null
  onClose: () => void
}) {
  const { data, isLoading, error } = useAdminDonationDetail(donationId)
  const receipt = useMarkReceiptIssued()
  const refund = useRecordDonationRefund()

  const [confirming, setConfirming] = useState(false)
  const [note, setNote] = useState("")

  if (donationId === null) return null

  const donation = data?.donation
  const account = data?.account

  async function handleIssueReceipt() {
    if (!donationId) return
    try {
      await receipt.mutateAsync(donationId)
      toast.add({
        title: "Receipt marked as issued",
        type: "success",
        timeout: 3000,
      })
    } catch (err) {
      toast.add({
        title: "Couldn't mark receipt",
        description: err instanceof Error ? err.message : "Try again",
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleRefund() {
    if (!donationId || !note.trim()) return
    try {
      await refund.mutateAsync({ id: donationId, note: note.trim() })
      toast.add({
        title: "Donation marked refunded",
        type: "success",
        timeout: 3000,
      })
      setConfirming(false)
      setNote("")
      onClose()
    } catch (err) {
      toast.add({
        title: "Couldn't refund",
        description: err instanceof Error ? err.message : "Try again",
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <SidePanel
      open
      onOpenChange={(o) => !o && onClose()}
      title={
        donation?.is_anonymous
          ? "Anonymous donation"
          : (donation?.donor_name ?? "Donation")
      }
      description={donation?.donor_email}
      header={
        donation && (
          <div className="flex flex-col gap-4 border-b border-border/60 px-8 pt-8 pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent">
                <User className="h-5 w-5 text-foreground" strokeWidth={1.75} />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {donation.is_anonymous
                    ? "Anonymous donor"
                    : (donation.donor_name ?? "Unnamed donor")}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {donation.donor_email}
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                      STATUS_TONE[donation.status] ?? "bg-muted"
                    }`}
                  >
                    {donation.status}
                  </span>
                  {donation.receipt_issued_at && (
                    <span className="rounded-full bg-green-light px-2 py-0.5 text-[11px] font-medium text-foreground">
                      Receipted
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Amount
              </p>
              <p className="mt-1 text-2xl font-light tracking-tight text-foreground tabular-nums">
                {fmtMoney(donation.amount, donation.currency)}
              </p>
            </div>
          </div>
        )
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

      {donation && (
        <div className="flex flex-col gap-5 px-6 pb-6">
          {/* Details */}
          <section className="rounded-xl border border-border bg-card p-4">
            <Row label="Reference">{donation.paystack_reference}</Row>
            <Row label="Transaction ID">
              {donation.paystack_transaction_id ?? "—"}
            </Row>
            <Row label="Tier">{donation.tier_label ?? "—"}</Row>
            <Row label="Anonymous">{donation.is_anonymous ? "Yes" : "No"}</Row>
            <Row label="Created">{fmtDate(donation.created_at)}</Row>
            <Row label="Verified">{fmtDate(donation.verified_at)}</Row>
            {donation.receipt_issued_at && (
              <Row label="Receipt issued">
                {fmtDate(donation.receipt_issued_at)}
                {data?.receipt_issued_by_name
                  ? ` · ${data.receipt_issued_by_name}`
                  : ""}
              </Row>
            )}
            {donation.refunded_at && (
              <Row label="Refunded">
                {fmtDate(donation.refunded_at)}
                {data?.refunded_by_name ? ` · ${data.refunded_by_name}` : ""}
              </Row>
            )}
            {donation.refund_note && (
              <Row label="Refund note">{donation.refund_note}</Row>
            )}
          </section>

          {/* Linked account */}
          {account && (
            <section className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Linked account
              </p>
              <div className="mt-2 flex flex-col gap-0.5">
                <p className="text-sm text-foreground">
                  {account.full_name ?? "Unnamed"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {account.email ?? "—"}
                </p>
                {account.phone && (
                  <p className="text-xs text-muted-foreground">
                    {account.phone}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Actions */}
          <section className="flex flex-col gap-3 border-t border-border/60 pt-4">
            {donation.status === "success" && !donation.receipt_issued_at && (
              <Button
                size="sm"
                variant="secondary"
                className="w-fit text-xs"
                disabled={receipt.isPending}
                onClick={handleIssueReceipt}
              >
                {receipt.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Receipt className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                )}
                Mark receipt as issued
              </Button>
            )}

            {donation.status === "success" && !confirming && (
              <Button
                size="sm"
                variant="outline"
                className="w-fit text-xs text-destructive"
                onClick={() => setConfirming(true)}
              >
                <Undo2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                Record refund
              </Button>
            )}

            {confirming && (
              <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">
                  Record refund
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  This marks the donation as refunded and records who processed
                  it. The money itself is refunded via Paystack — this only
                  updates your records.
                </p>
                <Field label="Refund note (required)">
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                    placeholder="e.g. Duplicate charge"
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                </Field>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={!note.trim() || refund.isPending}
                    onClick={handleRefund}
                  >
                    {refund.isPending ? "Recording…" : "Confirm refund"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={refund.isPending}
                    onClick={() => {
                      setConfirming(false)
                      setNote("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {donation.status === "success" && donation.receipt_issued_at && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-green"
                  strokeWidth={1.75}
                />
                Receipt issued
              </p>
            )}

            {donation.status === "refunded" && (
              <p className="text-xs text-muted-foreground">
                This donation has been refunded.
              </p>
            )}

            {donation.status === "pending" && (
              <p className="text-xs text-muted-foreground">
                This donation is still pending — the donor hasn&apos;t completed
                checkout.
              </p>
            )}

            {donation.status === "failed" && (
              <p className="text-xs text-muted-foreground">
                This donation failed at checkout. Nothing to do.
              </p>
            )}

            {donation.status === "abandoned" && (
              <p className="text-xs text-muted-foreground">
                The donor abandoned checkout before paying.
              </p>
            )}
          </section>
        </div>
      )}
    </SidePanel>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border/60 py-2.5 last:border-b-0">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-sm text-foreground">
        {children}
      </span>
    </div>
  )
}
