"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, ArrowRight, GraduationCap } from "lucide-react"
import { Loader } from "@/components/portals/shared/loader"

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
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center py-8">
      <div className="flex flex-col gap-5 rounded-xl bg-card p-6 shadow">
        {/* Header */}
        {state.kind === "loading" && (
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
              <GraduationCap
                className="h-4.5 w-4.5 text-foreground"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                Confirming payment
              </h1>
              <span className="truncate text-xs text-muted-foreground">
                Please don&apos;t close this window
              </span>
            </div>
          </div>
        )}

        {state.kind === "success" && (
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2
                className="h-5 w-5 text-primary"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                You&apos;re enrolled
              </h1>
              <span className="truncate text-xs text-muted-foreground">
                {state.data.programmeName ?? "Payment confirmed"}
              </span>
            </div>
          </div>
        )}

        {state.kind === "failed" && (
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <XCircle
                className="h-5 w-5 text-destructive"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                Payment not completed
              </h1>
              <span className="truncate text-xs text-muted-foreground">
                {state.message}
              </span>
            </div>
          </div>
        )}

        {/* Loading body */}
        {state.kind === "loading" && (
          <div className="flex items-center justify-center py-6">
            <Loader />
          </div>
        )}

        {/* Success body */}
        {state.kind === "success" && (
          <>
            <div className="h-px bg-border/60" />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Amount paid
                </span>
                <span className="text-sm font-medium tracking-tight text-foreground">
                  {state.data.currency === "ZAR" ? "R" : ""}
                  {(state.data.amount / 100).toFixed(2)}
                </span>
              </div>

              {state.data.channel && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Method
                  </span>
                  <span className="text-xs text-foreground capitalize">
                    {state.data.channel}
                  </span>
                </div>
              )}

              {state.data.paidAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Paid at
                  </span>
                  <span className="text-xs text-foreground">
                    {new Date(state.data.paidAt).toLocaleString("en-ZA", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <span className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Reference
                </span>
                <span className="truncate font-mono text-[11px] text-foreground">
                  {state.data.reference}
                </span>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            <Link
              href={backHref}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View programme
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </>
        )}

        {/* Failed body */}
        {state.kind === "failed" && (
          <>
            <div className="h-px bg-border/60" />

            <p className="text-xs leading-relaxed text-muted-foreground">
              If money left your account, it will be refunded automatically. You
              can retry the enrollment at any time from the programme page.
            </p>

            <div className="h-px bg-border/60" />

            <div className="flex flex-col gap-2">
              <Link
                href={backHref}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Try again
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
              <Link
                href="/programmes"
                className="flex h-11 w-full items-center justify-center rounded-lg bg-input text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Browse programmes
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
