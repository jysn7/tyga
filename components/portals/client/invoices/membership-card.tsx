// components/portals/client/billing/membership-card.tsx
"use client"

import { format } from "date-fns"
import { CreditCard, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  StatusPill,
  type StatusVariant,
} from "@/components/portals/shared/status-pill"
import { toast } from "@/components/ui/toast"
import {
  useCreateSubscription,
  useCancelSubscription,
} from "@/hooks/client/use-membership"

type MembershipStatus =
  "pending" | "active" | "non_renewing" | "cancelled" | "attention" | null

const STATUS_CONFIG: Record<
  Exclude<MembershipStatus, null>,
  { label: string; variant: StatusVariant; hint?: string }
> = {
  pending: { label: "Pending", variant: "warning" },
  active: { label: "Active", variant: "success" },
  non_renewing: { label: "Cancels soon", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "neutral" },
  attention: { label: "Payment failed", variant: "danger" },
}

export function MembershipCard({
  status,
  currentPeriodEnd,
  amount = 100,
}: {
  status: MembershipStatus
  currentPeriodEnd: string | null
  amount?: number
}) {
  const createSub = useCreateSubscription()
  const cancelSub = useCancelSubscription()

  const isActive = status === "active" || status === "non_renewing"
  const config = status ? STATUS_CONFIG[status] : null

  async function handleSubscribe() {
    try {
      const result = await createSub.mutateAsync()
      // Hand off to Paystack's hosted checkout.
      window.location.href = result.authorization_url
    } catch (err) {
      toast.add({
        title: "Couldn't start checkout",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleCancel() {
    try {
      await cancelSub.mutateAsync()
      toast.add({
        title: "Membership cancelled",
        description: "You'll keep access until the end of your current period.",
        type: "success",
        timeout: 5000,
      })
    } catch (err) {
      toast.add({
        title: "Couldn't cancel",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-light">
            <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                TYGA membership
              </h3>
              {config && (
                <StatusPill label={config.label} variant={config.variant} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              R{amount.toFixed(2)} / month · Covers all members in your family
            </p>
          </div>
        </div>
      </div>

      {/* Context line — changes with status */}
      <div className="text-xs text-muted-foreground">
        {status === "active" && currentPeriodEnd && (
          <span>
            Next charge on {format(new Date(currentPeriodEnd), "d MMM yyyy")}.
          </span>
        )}
        {status === "non_renewing" && currentPeriodEnd && (
          <span>
            Your membership ends on{" "}
            {format(new Date(currentPeriodEnd), "d MMM yyyy")}. Reactivate
            anytime before then.
          </span>
        )}
        {status === "attention" && (
          <span className="text-destructive">
            Your last payment failed. Update your card to keep access.
          </span>
        )}
        {(status === null || status === "cancelled") && (
          <span>
            Subscribe to unlock all TYGA programmes and benefits for your
            family.
          </span>
        )}
      </div>

      {/* Action */}
      <div className="flex items-center gap-2">
        {!isActive && (
          <Button
            size="sm"
            className="h-9 rounded-md bg-foreground px-4 text-xs font-medium text-background hover:bg-foreground/90"
            onClick={handleSubscribe}
            disabled={createSub.isPending}
          >
            {createSub.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Redirecting…
              </>
            ) : (
              <>
                <CreditCard className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                {status === "attention" ? "Update card" : "Subscribe"}
              </>
            )}
          </Button>
        )}

        {isActive && (
          <Button
            size="sm"
            variant="outline"
            className="h-9 rounded-md text-xs"
            onClick={handleCancel}
            disabled={cancelSub.isPending}
          >
            {cancelSub.isPending ? "Cancelling…" : "Cancel membership"}
          </Button>
        )}
      </div>
    </div>
  )
}
