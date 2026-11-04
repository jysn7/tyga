"use client"

import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useCancelMembership,
  useResumeMembership,
  useUpdateCard,
  type MyMembership,
} from "@/hooks/client/use-membership"
import { MembershipCancelDialog } from "./cancel-membership-dialog"

export function MembershipActions({
  membership,
  confirmingCancel,
  onStartConfirmCancel,
  onCloseConfirmCancel,
}: {
  membership: NonNullable<MyMembership["membership"]>
  confirmingCancel: boolean
  onStartConfirmCancel: () => void
  onCloseConfirmCancel: () => void
}) {
  const cancel = useCancelMembership()
  const resume = useResumeMembership()
  const card = useUpdateCard()

  const hasActions =
    membership.canUpdateCard || membership.canResume || membership.canCancel

  if (!hasActions && !confirmingCancel) return null

  return (
    <>
      {hasActions && (
        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
          {membership.canUpdateCard && (
            <Button
              size="sm"
              variant={
                membership.status === "attention" ? "default" : "outline"
              }
              disabled={card.isPending}
              onClick={() => card.mutate()}
            >
              <CreditCard className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
              {card.isPending ? "Opening…" : "Update card"}
            </Button>
          )}
          {membership.canResume && (
            <Button
              size="sm"
              disabled={resume.isPending}
              onClick={() => resume.mutate()}
            >
              {resume.isPending ? "Resuming…" : "Resume membership"}
            </Button>
          )}
          {membership.canCancel && !confirmingCancel && (
            <Button size="sm" variant="outline" onClick={onStartConfirmCancel}>
              Cancel membership
            </Button>
          )}
        </div>
      )}

      {confirmingCancel && (
        <MembershipCancelDialog
          membership={membership}
          isPending={cancel.isPending}
          onConfirm={() =>
            cancel.mutate(undefined, { onSuccess: onCloseConfirmCancel })
          }
          onKeep={onCloseConfirmCancel}
        />
      )}

      {(cancel.error || resume.error || card.error) && (
        <p role="alert" className="text-xs text-destructive">
          {(cancel.error ?? resume.error ?? card.error)?.message}
        </p>
      )}
    </>
  )
}
