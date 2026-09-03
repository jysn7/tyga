"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, UserCog } from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { CoachTableRow } from "./coach-row"
import type { Coach } from "@/hooks/admin/use-coaches"

const PAGE_SIZE = 10

export function CoachList({
  coaches,
  onEdit,
}: {
  coaches: Coach[]
  onEdit: (coach: Coach) => void
}) {
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(coaches.length / PAGE_SIZE))
  const clampedPage = Math.min(page, pageCount - 1)

  const paginated = useMemo(
    () =>
      coaches.slice(
        clampedPage * PAGE_SIZE,
        clampedPage * PAGE_SIZE + PAGE_SIZE
      ),
    [coaches, clampedPage]
  )

  if (coaches.length === 0) {
    return (
      <EmptyState
        icon={UserCog}
        title="No coaches found"
        description="No coaches match the current filter."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg bg-card shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              <th className="px-4 py-2.5 font-medium">Coach</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Max ratio</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((coach) => (
              <CoachTableRow key={coach.id} coach={coach} onEdit={onEdit} />
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            Page {clampedPage + 1} of {pageCount} · {coaches.length} coaches
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={clampedPage === 0}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={clampedPage >= pageCount - 1}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
