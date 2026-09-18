"use client"

import { Calendar, Users, CreditCard, Trophy } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import Link from "next/link"
import { StatTile } from "@/components/portals/client/overview/stat-tile"
import { OutstandingInvoiceBanner } from "@/components/portals/client/overview/outstanding-invoice-banner"
import { ChildCard } from "@/components/portals/client/overview/child-card"
import { UpcomingSessionsList } from "@/components/portals/client/overview/upcoming-sessions-list"
import { RecentProgressList } from "@/components/portals/client/overview/recent-progress-list"
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

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Welcome back"
        description="Here's what's happening with your family"
        action={
          <Button
            size="lg"
            variant="secondary"
            className="gap-1.5 rounded-lg text-xs"
          >
            <Link href="/schedule" className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Full schedule
            </Link>
          </Button>
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

      {/* Children cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="px-1 text-sm font-medium text-foreground">
            Your enrolled children
          </h2>
          <Link
            href="/members"
            className="text-sm text-information underline hover:text-information/60"
          >
            View All Members
          </Link>
        </div>
        {childrenLoading || !children ? (
          <div className="flex h-32 items-center justify-center">
            <Loader />
          </div>
        ) : children.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No members enrolled yet
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {sessionsLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader />
            </div>
          ) : (
            <UpcomingSessionsList sessions={sessions ?? []} />
          )}
        </div>

        <div>
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
