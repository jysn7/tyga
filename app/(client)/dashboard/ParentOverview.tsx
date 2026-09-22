"use client"

import Link from "next/link"
import { Calendar, Users, CreditCard, Trophy } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { StatTile } from "@/components/portals/client/overview/stat-tile"
import { OutstandingInvoiceBanner } from "@/components/portals/client/overview/outstanding-invoice-banner"
import { ChildCard } from "@/components/portals/client/overview/child-card"
import { UpcomingSessionsList } from "@/components/portals/client/overview/upcoming-sessions-list"
import { RecentProgressList } from "@/components/portals/client/overview/recent-progress-list"
import { MiniCalendar } from "@/components/portals/client/overview/mini-calendar"
import {
  useParentStats,
  useParentChildren,
  useParentUpcomingSessions,
  useParentProgress,
  useParentOutstandingInvoices,
} from "@/hooks/client/use-parent-overview"

export function ParentOverview() {
  const { data: stats, isLoading: statsLoading } = useParentStats()
  const { data: children, isLoading: childrenLoading } = useParentChildren()
  const { data: sessions, isLoading: sessionsLoading } =
    useParentUpcomingSessions()
  const { data: progress, isLoading: progressLoading } = useParentProgress()
  const { data: invoices, isLoading: invoicesLoading } =
    useParentOutstandingInvoices()

  // Only children who have an upcoming session, limited to 2
  const enrolledChildren = (children ?? [])
    .filter((c) => c.nextSession)
    .slice(0, 2)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Welcome back"
        description="Here's what's happening with your family"
        action={
          <Link
            href="/schedule"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-input px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
            Full schedule
          </Link>
        }
      />

      {/* Stat tiles */}
      {statsLoading || !stats ? (
        <div className="flex h-24 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Active members"
            value={String(stats.activeMembers)}
            icon={Users}
          />
          <StatTile
            label="Upcoming sessions"
            value={String(stats.upcomingSessions)}
            icon={Calendar}
          />
          <StatTile
            label="Outstanding balance"
            value={`R${stats.outstandingBalance.toLocaleString()}`}
            icon={CreditCard}
          />
          <StatTile
            label="Badges this month"
            value={String(stats.badgesThisMonth)}
            icon={Trophy}
          />
        </div>
      )}

      {/* Outstanding invoice banner */}
      {!invoicesLoading && invoices && (
        <OutstandingInvoiceBanner invoices={invoices} />
      )}

      {/* Two-column: main content + sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Upcoming lessons */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Upcoming lessons
              </h2>
              <Link
                href="/members"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View all members
              </Link>
            </div>

            {childrenLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader />
              </div>
            ) : enrolledChildren.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-8 text-center shadow">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
                  <Calendar
                    className="h-4.5 w-4.5 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    No upcoming lessons
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Your children don&apos;t have any sessions scheduled yet.
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {enrolledChildren.map((child, i) => (
                  <ChildCard key={child.id} child={child} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming sessions list */}
          {sessionsLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader />
            </div>
          ) : (
            <UpcomingSessionsList sessions={sessions ?? []} />
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {sessionsLoading ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
              <Loader />
            </div>
          ) : (
            <MiniCalendar sessions={sessions ?? []} />
          )}

          {progressLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader />
            </div>
          ) : (
            <RecentProgressList items={progress ?? []} />
          )}
        </div>
      </div>
    </div>
  )
}
