"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  AccessDeniedError,
  useParentSessionDetail,
} from "@/hooks/client/use-parent-sessions"
import { SessionDetailView } from "@/components/portals/client/sessions/session-detail-view"

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>()
  const sessionId = Number(params.id)
  const { data, isLoading, error, refetch } = useParentSessionDetail(sessionId)

  const invalidId = !Number.isInteger(sessionId) || sessionId <= 0

  return (
    <main className="mx-auto flex w-full flex-col gap-6 p-4 sm:p-6">
      <Link href="/schedule" className="text-sm text-(--d-primary)">
        Back to schedule
      </Link>

      {isLoading && !invalidId && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--d-primary) border-t-transparent" />
          <p className="text-xs text-(--d-muted-foreground)">
            Loading session...
          </p>
        </div>
      )}

      {(invalidId || error instanceof AccessDeniedError) && (
        <div className="rounded-xl border border-(--d-border) p-6 text-center">
          <h1 className="text-lg font-semibold text-(--d-foreground)">
            Session not found
          </h1>
          <p className="mt-1 text-sm text-(--d-muted-foreground)">
            This session doesn&apos;t exist or isn&apos;t part of your
            family&apos;s schedule.
          </p>
        </div>
      )}

      {error && !(error instanceof AccessDeniedError) && !invalidId && (
        <div className="flex flex-col gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-500">Could not load this session.</p>
          <button
            onClick={() => refetch()}
            className="self-start rounded-xl border border-(--d-border) px-4 py-2 text-sm text-(--d-foreground)"
          >
            Try again
          </button>
        </div>
      )}

      {data && <SessionDetailView session={data} />}
    </main>
  )
}
