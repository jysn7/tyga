"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { EmptyCard, Section } from "./member-detail-sections"

const PAGE_SIZE = 10

export function AuditTab({
  history,
}: {
  history: {
    id: number
    field: string
    user_name: string | null
    user_email: string | null
    reason: string | null
    accessed_at: string
  }[]
}) {
  const [page, setPage] = useState(1)

  if (history.length === 0) {
    return (
      <EmptyCard
        title="No access logged"
        description="No one has accessed this member's sensitive data yet."
      />
    )
  }

  const totalPages = Math.ceil(history.length / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE
  const paginated = history.slice(start, start + PAGE_SIZE)

  return (
    <Section
      title="Sensitive data access log"
      description="Who viewed medical notes, DOB, or emergency contacts — and why."
    >
      <div className="flex flex-col">
        {paginated.map((a) => (
          <div
            key={a.id}
            className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground capitalize">
                {a.field.replace(/_/g, " ")}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {a.user_name ?? a.user_email ?? "Unknown"} ·{" "}
                <span className="italic">{a.reason ?? "No reason given"}</span>
              </span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {format(new Date(a.accessed_at), "d MMM yyyy, HH:mm")}
            </span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 items-center gap-1 rounded-md bg-input px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 items-center gap-1 rounded-md bg-input px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </Section>
  )
}
