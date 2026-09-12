// components/portals/admin/coaches/pending-invites-panel.tsx
"use client"

import { useState } from "react"
import { Mail, X, UserPlus } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import {
  useCoachInvites,
  useRevokeCoachInvite,
} from "@/hooks/admin/invites/use-coach-invites"

const COACH_TYPE_LABELS: Record<string, string> = {
  head_coach: "Head coach",
  assistant_coach: "Assistant coach",
  volunteer: "Volunteer",
}

export function PendingInvitesPanel({
  open,
  onOpenChange,
  onInviteNew,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInviteNew: () => void
}) {
  const { data: invites, isLoading } = useCoachInvites("pending")
  const revokeInvite = useRevokeCoachInvite()
  const [revokingId, setRevokingId] = useState<number | null>(null)

  async function handleRevoke(id: number, email: string) {
    setRevokingId(id)
    try {
      await revokeInvite.mutateAsync(id)
      toast.add({
        title: "Invite revoked",
        description: email,
        type: "success",
        timeout: 4000,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to revoke invite",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Pending invites"
      header={
        <div className="flex items-center gap-4 px-8 pt-8 pb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-input">
            <Mail className="h-6 w-6 text-foreground" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Pending invites
            </span>
            <span className="text-sm text-muted-foreground">
              {invites?.length ?? 0} awaiting response
            </span>
          </div>
        </div>
      }
      footer={
        <Button
          className="w-full gap-1.5 rounded-lg text-sm"
          onClick={onInviteNew}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite another coach
        </Button>
      }
    >
      <div className="flex flex-col rounded-lg border border-border/60 bg-card px-4">
        {isLoading ? (
          <div className="flex flex-col divide-y divide-border/60">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-4">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : !invites || invites.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={Mail}
              title="No pending invites"
              description="Invites you send will show up here until they're accepted."
            />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="group flex items-center gap-3 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60">
                  <Mail
                    className="h-4 w-4 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {invite.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {invite.coachType
                      ? COACH_TYPE_LABELS[invite.coachType]
                      : "No type set"}
                    {invite.invitedByName
                      ? ` · Invited by ${invite.invitedByName}`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(invite.id, invite.email)}
                  disabled={revokingId === invite.id}
                  title="Revoke invite"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidePanel>
  )
}
