"use client"

import Link from "next/link"
import { Activity, ChevronRight, History, Settings } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"

const SECTIONS = [
  {
    href: "/admin/system/settings",
    label: "Settings",
    description:
      "Academy details, billing configuration, and notifications preferences.",
    icon: Settings,
  },
  {
    href: "/admin/system/audit",
    label: "Audit log",
    description: "Every admin action with who, when, and what was changed.",
    icon: History,
  },
  {
    href: "/admin/system/health",
    label: "System health",
    description: "Database integrity checks, scheduled jobs, and data exports.",
    icon: Activity,
  },
] as const

export default function SystemPage() {
  return (
    <div className="max-w-8xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="System"
        description="Academy settings, audit trail, and system health"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-5 shadow transition-colors hover:border-border hover:bg-accent/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon
                    className="h-4 w-4 text-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                  strokeWidth={1.75}
                />
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold text-foreground">
                  {s.label}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
