"use client"

import Link from "next/link"
import { format, parseISO } from "date-fns"
import {
  Clock,
  Users,
  BellRing,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import { toast } from "@/components/ui/toast"
import { useLeaveWaitlist, useMyWaitlist } from "@/hooks/client/use-waitlist"

const date = (s: string | null) => (s ? format(parseISO(s), "d MMM yyyy") : "—")

export default function WaitlistPage() {
  const { data: entries = [], isLoading, error } = useMyWaitlist()
  const leave = useLeaveWaitlist()

  const notified = entries.filter((e) => e.status === "notified")
  const waiting = entries.filter((e) => e.status === "waiting")

  function handleLeave(id: number) {
    leave.mutate(id, {
      onSuccess: () => {
        toast.add({
          title: "Left the waiting list",
          type: "success",
          timeout: 4000,
        })
      },
      onError: (err) => {
        toast.add({
          title: "Couldn't leave the waiting list",
          description:
            err instanceof Error ? err.message : "Something went wrong",
          type: "error",
          timeout: 5000,
        })
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Waiting lists"
        description="Programmes you're queued for, and any open offers."
      />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">
          {error.message ?? "Could not load your waitlists."}
        </p>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Users}
          title="You're not on any waiting lists"
          description="When a programme is full, you can join its waiting list and we'll notify you when a place opens up."
        />
      ) : (
        <>
          {/* Offers — high priority, surfaced first */}
          {notified.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <BellRing
                  className="h-4 w-4 shrink-0 text-information"
                  strokeWidth={1.75}
                />
                <h2 className="text-sm font-semibold text-foreground">
                  Places waiting for you
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({notified.length})
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                A place has opened up on these programmes. Places go to whoever
                enrols first — act soon.
              </p>

              <div className="flex flex-col gap-2">
                {notified.map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-col gap-3 rounded-lg border border-blue-light bg-blue-light/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {e.programmeName}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-light px-2 py-0.5 text-[10px] font-medium text-information">
                          <Clock className="h-3 w-3" strokeWidth={2} />
                          Offer open
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        For {e.memberName} · Position #{e.position} · Notified{" "}
                        {date(e.notifiedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/programmes/${e.programmeId}`}
                        className="inline-flex h-9 items-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        View programme
                      </Link>
                      <Link
                        href={`/programmes/${e.programmeId}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                      >
                        Enrol now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Waiting entries */}
          {waiting.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Users
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <h2 className="text-sm font-semibold text-foreground">
                  Waiting for a place
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({waiting.length})
                </span>
              </div>

              <div className="overflow-hidden rounded-lg bg-card shadow">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-foreground/80 text-[11px] tracking-wider text-background uppercase">
                      <th className="px-4 py-2.5 font-medium">Programme</th>
                      <th className="px-4 py-2.5 font-medium">Child</th>
                      <th className="px-4 py-2.5 font-medium">Position</th>
                      <th className="px-4 py-2.5 font-medium">Joined</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {waiting.map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-border/60 last:border-b-0"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/programmes/${e.programmeId}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {e.programmeName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {e.memberName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                            #{e.position}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {date(e.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleLeave(e.id)}
                            disabled={leave.isPending}
                            className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                          >
                            {leave.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Leave"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Footer help */}
          <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <CheckCircle2
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green"
              strokeWidth={2}
            />
            <p className="leading-relaxed">
              You&apos;ll get a notification when a place opens up. You have 48
              hours to enrol before the place goes to the next family. Joining a
              waiting list is free and doesn&apos;t obligate you to enrol.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
