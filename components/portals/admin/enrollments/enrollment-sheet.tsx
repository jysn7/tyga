"use client"

import { useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { AlertTriangle, User } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Field } from "@/components/portals/shared/field"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { toast } from "@/components/ui/toast"
import {
  useEnrollmentDetail,
  useUpdateEnrollmentStatus,
  type EnrollmentAction,
} from "@/hooks/admin/use-admin-enrollments"
import { StatusBadge, PaymentBadge } from "./enrollment-badges"

const FINANCE_ROUTE = "/admin/finance" // adjust

const ACTION_META: Record<
  EnrollmentAction,
  {
    label: string
    needsReason: boolean
    confirm: string
    destructive?: boolean
  }
> = {
  activate: {
    label: "Activate",
    needsReason: true,
    confirm:
      "Activate this enrolment without waiting for payment? The invoice stays unpaid — use this for comped or subsidised places. For a normal payment, use Record payment on the invoice instead.",
  },
  cancel: {
    label: "Cancel enrolment",
    needsReason: false,
    confirm: "Cancel this unpaid enrolment? Its invoice will be voided.",
    destructive: true,
  },
  pause: {
    label: "Pause",
    needsReason: true,
    confirm:
      "Pause this enrolment? The child is removed from upcoming rosters but keeps their history.",
  },
  resume: {
    label: "Resume",
    needsReason: true,
    confirm: "Resume this enrolment? It needs a free place in the programme.",
  },
  withdraw: {
    label: "Withdraw",
    needsReason: true,
    confirm:
      "Withdraw this member? They are removed from upcoming sessions and their place is released. History is kept.",
    destructive: true,
  },
}

const money = (n: number | null) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
      }).format(n)

const fmtDate = (iso: string) => format(parseISO(iso), "d MMM yyyy")
const fmtDateTime = (iso: string) => format(parseISO(iso), "d MMM yyyy, HH:mm")

interface EnrollmentSheetProps {
  id: number | null
  onClose: () => void
}

/**
 * Side panel for reviewing a single enrolment and applying lifecycle actions.
 * It shows the member, programme, invoice, and status history, then lets admin staff
 * activate, cancel, pause, resume, or withdraw the enrolment with an optional reason.
 */
export function EnrollmentSheet({ id, onClose }: EnrollmentSheetProps) {
  const { data, isLoading, error } = useEnrollmentDetail(id)
  const update = useUpdateEnrollmentStatus()
  const [pending, setPending] = useState<EnrollmentAction | null>(null)
  const [reason, setReason] = useState("")

  const resetDraft = () => {
    setPending(null)
    setReason("")
    update.reset()
  }

  function confirmAction() {
    if (!id || !pending) return
    update.mutate(
      { enrollmentId: id, action: pending, reason },
      {
        onSuccess: () => {
          toast.add({
            title: "Enrolment updated",
            description: "The enrolment status has been updated successfully.",
            type: "success",
            timeout: 4000,
          })
          resetDraft()
        },
        onError: (err) => {
          toast.add({
            title: "Failed to update enrolment",
            description: err.message,
            type: "error",
            timeout: 5000,
          })
        },
      }
    )
  }

  const meta = pending ? ACTION_META[pending] : null
  const canConfirm =
    !update.isPending && (!meta?.needsReason || reason.trim().length > 0)

  return (
    <SidePanel
      open={id !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          resetDraft()
        }
      }}
      title="Enrolment detail"
      header={
        <div className="flex items-center gap-4 px-8 pt-8 pb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent">
            <User className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {data ? data.member.full_name : "Enrolment"}
            </span>
            <span className="text-sm text-muted-foreground">
              {data
                ? `${data.programme.name}${data.programme.level_name ? ` · ${data.programme.level_name}` : ""}`
                : "Loading details..."}
            </span>
          </div>
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
          <div className="flex items-center gap-2">
            <StatusBadge status={data.status} />
            <span className="text-xs text-muted-foreground">
              Enrolled {data.joined_at ? fmtDate(data.joined_at) : "—"}
            </span>
          </div>

          {data.refund_review && (
            <div className="flex flex-col gap-2 rounded-xl bg-orange-light p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangle className="h-4 w-4 stroke-[1.75]" />
                Refund review needed
              </div>
              <p className="text-xs text-foreground">
                This enrolment was paid and then withdrawn. Decide whether a
                refund is owed in Finance.
              </p>
              <Link
                href={`${FINANCE_ROUTE}?tab=refunds`}
                className="self-start text-xs text-information underline"
              >
                Decide in Finance, Refunds
              </Link>
            </div>
          )}

          <div className="flex w-full flex-col gap-3 md:flex-row">
            <div className="w-full rounded-lg bg-card p-3 shadow">
              <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                Parent
              </p>
              <p className="mt-1 text-sm text-foreground">
                {data.parent.full_name ?? "—"}
              </p>
              {data.parent.phone && (
                <p className="text-xs text-muted-foreground">
                  {data.parent.phone}
                </p>
              )}
              {data.parent.email && (
                <p className="text-xs text-muted-foreground">
                  {data.parent.email}
                </p>
              )}
            </div>
            <div className="w-full rounded-lg bg-card p-3 shadow">
              <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                Invoice
              </p>
              <div className="mt-1 flex items-center gap-2">
                <PaymentBadge
                  status={data.invoice?.status ?? null}
                  held={data.status === "paused"}
                />
                <span className="text-sm text-foreground">
                  {money(data.invoice?.total_amount ?? null)}
                </span>
              </div>
              {data.invoice && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Paid {money(data.invoice.amount_paid)}
                  {data.invoice.due_at
                    ? ` · due ${fmtDate(data.invoice.due_at)}`
                    : ""}
                </p>
              )}
              {data.invoice && (
                <Link
                  href={`${FINANCE_ROUTE}?invoice=${data.invoice.id}`}
                  className="mt-1 inline-block text-xs text-information underline"
                >
                  View invoice
                </Link>
              )}
            </div>
          </div>

          {data.programme.capacity != null && (
            <div className="rounded-xl bg-card p-3 shadow">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Programme places</span>
                <span>
                  {data.programme.active_count} of {data.programme.capacity}{" "}
                  taken
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(100, (data.programme.active_count / data.programme.capacity) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {data.allowed_actions.length > 0 && !pending && (
            <Field label="Actions">
              <div className="flex flex-wrap gap-2">
                {data.allowed_actions.map((a) => (
                  <Button
                    key={a}
                    size="sm"
                    variant="outline"
                    className={`text-xs ${ACTION_META[a].destructive ? "border-destructive/50 text-destructive hover:bg-destructive/10" : ""}`}
                    onClick={() => {
                      update.reset()
                      setPending(a)
                    }}
                  >
                    {ACTION_META[a].label}
                  </Button>
                ))}
              </div>
            </Field>
          )}

          {/* Inline confirm */}
          {pending && meta && (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">
                {meta.label}
              </p>
              <p className="text-xs text-muted-foreground">{meta.confirm}</p>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Reason {meta.needsReason ? "(required)" : "(optional)"}
                </span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              {update.error && (
                <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {update.error.message}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={!canConfirm}
                  className={`text-xs ${meta.destructive ? "bg-destructive text-white hover:bg-destructive/90" : ""}`}
                  onClick={confirmAction}
                >
                  {update.isPending
                    ? "Saving..."
                    : `Confirm ${meta.label.toLowerCase()}`}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  disabled={update.isPending}
                  onClick={() => {
                    setPending(null)
                    setReason("")
                    update.reset()
                  }}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* History */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Status history
            </h3>
            {data.history.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No changes recorded yet.
              </p>
            ) : (
              <ol className="flex flex-col gap-3 border-l border-border pl-4">
                {data.history.map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute top-1.5 -left-[21px] h-2 w-2 rounded-full bg-primary" />
                    <p className="text-xs text-foreground">
                      {h.from_status ? `${h.from_status} → ` : ""}
                      <span className="font-medium">{h.to_status}</span>
                    </p>
                    {h.reason && (
                      <p className="text-xs text-muted-foreground">
                        “{h.reason}”
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {h.changed_by ?? "System"} · {fmtDateTime(h.changed_at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </SidePanel>
  )
}
