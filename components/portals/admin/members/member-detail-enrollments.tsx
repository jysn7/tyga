"use client"

import Link from "next/link"
import { format } from "date-fns"
import { EmptyCard, Section } from "./member-detail-sections"

export function EnrollmentsTab({
  enrollments,
}: {
  enrollments: {
    id: number
    programme_id: number
    programme_name: string
    venue_name: string | null
    joined_at: string
    status: string
  }[]
}) {
  if (enrollments.length === 0) {
    return (
      <EmptyCard
        title="No enrollments"
        description="This member isn't enrolled in any programmes."
      />
    )
  }
  return (
    <Section title="Enrollments">
      <div className="flex flex-col">
        {enrollments.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <Link
                href={`/admin/programmes/${e.programme_id}`}
                className="truncate text-sm font-medium text-foreground transition-colors hover:text-primary hover:underline"
              >
                {e.programme_name}
              </Link>
              <span className="truncate text-xs text-muted-foreground">
                {e.venue_name ?? "No venue"} · Joined{" "}
                {format(new Date(e.joined_at), "d MMM yyyy")}
              </span>
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium text-foreground capitalize ${
                e.status === "active"
                  ? "bg-green-light"
                  : e.status === "cancelled"
                    ? "bg-rose"
                    : "bg-input text-muted-foreground"
              }`}
            >
              {e.status}
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}
