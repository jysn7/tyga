// components/portals/admin/members/member-list.tsx
"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { AdminMemberTableRow } from "./member-row"
import type { AdminMember } from "@/hooks/admin/use-members"
import { Users } from "lucide-react"

const PAGE_SIZE = 10

export function AdminMemberList({ members }: { members: AdminMember[] }) {
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(members.length / PAGE_SIZE))
  const clampedPage = Math.min(page, pageCount - 1)

  const paginated = useMemo(
    () =>
      members.slice(
        clampedPage * PAGE_SIZE,
        clampedPage * PAGE_SIZE + PAGE_SIZE
      ),
    [members, clampedPage]
  )

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members found"
        description="No members match the current filter."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border border-border/60">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              <th className="px-4 py-2.5 font-medium">Member</th>
              <th className="px-4 py-2.5 font-medium">Parent account</th>
              <th className="px-4 py-2.5 font-medium">Level</th>
              <th className="px-4 py-2.5 font-medium">Enrollments</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((member) => (
              <AdminMemberTableRow key={member.id} member={member} />
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            Page {clampedPage + 1} of {pageCount} · {members.length} members
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
