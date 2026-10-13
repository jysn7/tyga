"use client"

import Link from "next/link"
import {
  CalendarDays,
  LayoutGrid,
  Users,
  ImageIcon,
  Type,
  ArrowRight,
} from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"

const SECTIONS = [
  {
    href: "/admin/marketing/events",
    label: "Events",
    description: "Upcoming events shown on the public site",
    icon: CalendarDays,
  },
  {
    href: "/admin/marketing/programmes",
    label: "Programmes",
    description: "Public programme cards, linked to operational programmes",
    icon: LayoutGrid,
  },
  {
    href: "/admin/marketing/team",
    label: "Team",
    description: "Staff profiles shown on the About page",
    icon: Users,
  },
  {
    href: "/admin/marketing/gallery",
    label: "Gallery",
    description: "Categorised images for the public gallery",
    icon: ImageIcon,
  },
  {
    href: "/admin/marketing/site-content",
    label: "Site Content",
    description: "Homepage hero, copy, contact details, and SEO",
    icon: Type,
  },
]

export default function MarketingLandingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Marketing Site"
        description="Manage content shown on the public-facing website"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col justify-between rounded-xl bg-card p-5 shadow transition-colors hover:bg-accent/50"
            >
              <div className="flex flex-col gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Icon
                    className="h-4 w-4 text-foreground"
                    strokeWidth={1.75}
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    {section.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {section.description}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                Manage
                <ArrowRight
                  className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
