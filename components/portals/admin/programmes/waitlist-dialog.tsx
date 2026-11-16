"use client"

import { format, parseISO } from "date-fns"
import { Users, BellRing } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { useProgrammeWaitlist } from "@/hooks/admin/programmes/use-waitlist"
import type { AdminProgramme } from "@/hooks/admin/programmes/use-programmes"

export function ProgrammeWaitlistDialog({
  programme,
  open,
  onOpenChange,
}: {
  programme: AdminProgramme | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: entries = [], isLoading } = useProgrammeWaitlist(
    programme?.id ?? null
  )

  if (!programme) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Waitlist — {programme.name}</DialogTitle>
          <DialogDescription>
            {entries.length} famil{entries.length === 1 ? "y" : "ies"} waiting
            for a place. Places are offered in queue order as they open up.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No one is waiting"
            description="The waitlist is empty for this programme."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border/60 rounded-lg border border-border/60">
            {entries.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                    #{e.queuePosition}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium text-foreground">
                      {e.memberName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {e.parentName ?? "—"}
                      {e.parentPhone && <> · {e.parentPhone}</>}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {e.status === "notified" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-light px-2 py-0.5 text-[10px] font-medium text-blue">
                      <BellRing className="h-3 w-3" strokeWidth={1.75} />
                      Notified
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    Joined {format(parseISO(e.createdAt), "d MMM")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
