"use client"

import Link from "next/link"
import {
  Calendar,
  Users,
  CreditCard,
  Trophy,
  Receipt,
  GraduationCap,
  ListOrdered,
} from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { StatTile } from "@/components/portals/client/overview/stat-tile"
import { OutstandingInvoiceBanner } from "@/components/portals/client/overview/outstanding-invoice-banner"
import { ChildCard } from "@/components/portals/client/overview/child-card"
import { RecentProgressList } from "@/components/portals/client/overview/recent-progress-list"
import { MiniCalendar } from "@/components/portals/client/overview/mini-calendar"
import { ProgrammeCarousel } from "@/components/portals/client/overview/programme-carousel"
import { OnboardingBlock } from "@/components/portals/client/overview/onboarding-block"
import { OnboardingBlockSidebar } from "@/components/portals/client/overview/onboarding-sidebar"
import {
  useParentStats,
  useParentChildren,
  useParentUpcomingSessions,
  useParentProgress,
  useParentOutstandingInvoices,
} from "@/hooks/client/use-parent-overview"
import { useProgrammes } from "@/hooks/client/use-programmes"
import { useAppStore } from "@/stores/useAppStore"

const QUICK_LINKS = [
  { label: "Schedule", href: "/my-schedule", icon: Calendar },
  { label: "Members", href: "/members", icon: Users },
  { label: "Programmes", href: "/programmes", icon: GraduationCap },
  { label: "Waiting lists", href: "/dashboard/waitlist", icon: ListOrdered },
  { label: "Billing", href: "/billing", icon: Receipt },
]

function firstName(fullName: string | null | undefined): string | null {
  if (!fullName) return null
  const first = fullName.trim().split(/\s+/)[0]
  return first || null
}

export function ParentOverview() {
  const account = useAppStore((s) => s.account)
  const name = firstName(account?.full_name)

  const { data: stats, isLoading: statsLoading } = useParentStats()
  const { data: children, isLoading: childrenLoading } = useParentChildren()
  const { data: sessions, isLoading: sessionsLoading } =
    useParentUpcomingSessions()
  const { data: progress, isLoading: progressLoading } = useParentProgress()
  const { data: invoices, isLoading: invoicesLoading } =
    useParentOutstandingInvoices()

  const { data: programmes, isLoading: programmesLoading } = useProgrammes(
    null,
    true
  )

  const enrolledChildren = (children ?? [])
    .filter((c) => c.nextSession)
    .slice(0, 2)

  return (
    <div className="flex flex-col gap-2">
      <PageHeader
        title={name ? `Welcome back, ${name}` : "Welcome back"}
        description="Here's what's happening with your family"
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex w-full flex-col gap-6 lg:col-span-2">
          <OnboardingBlock />

          {statsLoading || !stats ? (
            <div className="flex min-h-50 items-center justify-center">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              <StatTile
                color="gray"
                label="Active members"
                value={String(stats.activeMembers)}
                icon={Users}
                compact
              />
              <StatTile
                color="gray"
                label="Badges this month"
                value={String(stats.badgesThisMonth)}
                icon={Trophy}
                compact
              />
              <div className="col-span-2">
                <StatTile
                  color="teal"
                  label="Outstanding balance"
                  value={`R${stats.outstandingBalance.toLocaleString()}`}
                  icon={CreditCard}
                  compact
                />
              </div>
            </div>
          )}

          {!invoicesLoading && invoices && (
            <OutstandingInvoiceBanner invoices={invoices} />
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Explore programmes
              </h2>
              <Link
                href="/programmes"
                className="text-xs font-medium text-information underline transition-colors hover:text-information/70"
              >
                View all
              </Link>
            </div>

            {programmesLoading ? (
              <div className="flex h-56 items-center justify-center rounded-xl bg-card shadow">
                <Loader />
              </div>
            ) : (
              <ProgrammeCarousel programmes={programmes ?? []} />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Enrolled members
              </h2>
              <Link
                href="/members"
                className="text-xs font-medium text-information underline transition-colors hover:text-information/70"
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
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-light dark:bg-blue/10">
                  <Calendar
                    className="h-4.5 w-4.5 text-blue"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    No enrolled members
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Your children aren&apos;t actively enrolled in any
                    programmes yet.
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
        </div>

        {/* Sidebar */}
        <aside className="flex w-full flex-col gap-6 lg:sticky lg:top-6 lg:col-span-1 lg:self-start">
          <OnboardingBlockSidebar />

          {sessionsLoading ? (
            <div className="flex min-h-70 items-center justify-center rounded-xl bg-card shadow">
              <Loader />
            </div>
          ) : (
            <MiniCalendar sessions={sessions ?? []} />
          )}

          {progressLoading ? (
            <div className="flex h-32 w-full items-center justify-center">
              <Loader />
            </div>
          ) : (
            <RecentProgressList items={progress ?? []} />
          )}

          <div className="flex w-full flex-col gap-2">
            <span className="px-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Quick links
            </span>
            <div className="flex w-full flex-col gap-1">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex w-full items-center gap-2.5 rounded-lg bg-card px-3 py-2 text-xs font-medium text-foreground shadow transition-colors hover:border-border hover:bg-accent/50 md:py-4"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-light">
                      <Icon className="h-3 w-3 text-blue" strokeWidth={1.75} />
                    </span>
                    <span className="flex-1 text-left">{link.label}</span>
                    <GraduationCap
                      className="h-3 w-3 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
