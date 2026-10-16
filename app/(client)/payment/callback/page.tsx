"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  CreditCard,
} from "lucide-react"

type VerifyResult = {
  success: boolean
  status: string
  reference: string
  amount: number
  currency: string
  channel?: string
  paidAt?: string
  programmeId?: number | string | null
  programmeName?: string | null
}

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
    maximumFractionDigits: 2,
  }).format(amount / 100)

export default function PaymentCallbackPage() {
  const params = useSearchParams()
  const reference = params.get("reference") ?? params.get("trxref")

  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "success"; data: VerifyResult }
    | { kind: "failed"; message: string; data?: VerifyResult }
  >(
    reference
      ? { kind: "loading" }
      : { kind: "failed", message: "No payment reference provided." }
  )

  useEffect(() => {
    if (!reference) return

    let cancelled = false

    async function verify() {
      try {
        const res = await fetch(
          `/api/paystack/verify?reference=${encodeURIComponent(reference!)}`,
          { cache: "no-store" }
        )
        const data = await res.json()

        if (cancelled) return

        if (!res.ok) {
          setState({
            kind: "failed",
            message: data?.error ?? "We couldn't verify this payment.",
          })
          return
        }

        if (data.success) {
          setState({ kind: "success", data })
        } else {
          setState({
            kind: "failed",
            message:
              data.status === "abandoned"
                ? "This payment was not completed."
                : `Payment status: ${data.status}`,
            data,
          })
        }
      } catch (err) {
        if (cancelled) return
        setState({
          kind: "failed",
          message: err instanceof Error ? err.message : "Verification failed.",
        })
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [reference])

  const backHref =
    state.kind === "success" && state.data.programmeId
      ? `/programmes/${state.data.programmeId}`
      : state.kind === "failed" && state.data?.programmeId
        ? `/programmes/${state.data.programmeId}`
        : "/programmes"

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-8 sm:px-0">
      <div className="flex flex-col gap-6 rounded-xl bg-card p-6 shadow">
        {/* ---------- Header ---------- */}
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              state.kind === "success"
                ? "bg-green"
                : state.kind === "failed"
                  ? "bg-rose"
                  : "bg-input"
            }`}
          >
            {state.kind === "loading" && (
              <Loader2
                className="h-5 w-5 animate-spin text-muted-foreground"
                strokeWidth={1.75}
              />
            )}
            {state.kind === "success" && (
              <CheckCircle2
                className="h-5 w-5 text-secondary"
                strokeWidth={1.75}
              />
            )}
            {state.kind === "failed" && (
              <XCircle className="h-5 w-5 text-secondary" strokeWidth={1.75} />
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
              {state.kind === "loading" && "Confirming payment"}
              {state.kind === "success" && "You're enrolled"}
              {state.kind === "failed" && "Payment not completed"}
            </h1>
            <span className="truncate text-xs text-muted-foreground">
              {state.kind === "loading" && "Please don't close this window"}
              {state.kind === "success" &&
                (state.data.programmeName ?? "Payment confirmed")}
              {state.kind === "failed" && state.message}
            </span>
          </div>
        </div>

        {/* ---------- Loading ---------- */}
        {state.kind === "loading" && (
          <p className="text-xs text-muted-foreground">
            This usually takes a few seconds. We&apos;re checking with the
            payment provider.
          </p>
        )}

        {/* ---------- Success ---------- */}
        {state.kind === "success" && (
          <>
            <div className="h-px bg-border/60" />

            <div className="flex flex-col gap-3">
              <Row label="Amount paid">
                <span className="text-sm font-medium tracking-tight text-foreground">
                  {money(state.data.amount, state.data.currency)}
                </span>
              </Row>

              {state.data.channel && (
                <Row label="Method">
                  <span className="text-xs text-foreground capitalize">
                    {state.data.channel}
                  </span>
                </Row>
              )}

              {state.data.paidAt && (
                <Row label="Paid at">
                  <span className="text-xs text-foreground">
                    {new Date(state.data.paidAt).toLocaleString("en-ZA", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </Row>
              )}

              <Row label="Reference">
                <span className="truncate font-mono text-xs text-foreground">
                  {state.data.reference}
                </span>
              </Row>
            </div>

            <div className="h-px bg-border/60" />

            <div className="flex flex-col gap-2">
              <Link
                href={backHref}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-xs font-medium text-secondary transition-colors hover:bg-foreground/90"
              >
                View programme
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
              <Link
                href="/dashboard"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-foreground bg-card text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                Go to dashboard
              </Link>
            </div>
          </>
        )}

        {/* ---------- Failed ---------- */}
        {state.kind === "failed" && (
          <>
            <div className="h-px bg-border/60" />

            <p className="text-xs leading-relaxed text-muted-foreground">
              If money left your account, it will be refunded automatically. You
              can retry the enrolment at any time from the programme page.
            </p>

            <div className="h-px bg-border/60" />

            <div className="flex flex-col gap-2">
              <Link
                href={backHref}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-xs font-medium text-secondary transition-colors hover:bg-foreground/90"
              >
                Try again
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
              <Link
                href="/programmes"
                className="flex h-11 w-full items-center justify-center rounded-lg border border-foreground bg-card text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                Browse programmes
              </Link>
            </div>

            <div className="flex items-center gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span>
                Need help? Contact the academy if you were charged incorrectly.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
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
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}
