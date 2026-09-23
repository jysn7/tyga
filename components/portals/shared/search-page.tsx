"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Search,
  User,
  Trophy,
  Users,
  ShieldCheck,
  Receipt,
  CalendarCheck,
  Calendar,
  Star,
  ArrowRight,
  Layers,
  BookOpen,
  MapPin,
} from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { useGlobalSearch, type SearchResult } from "@/hooks/use-global-search"

const ICONS: Record<SearchResult["type"], React.ElementType> = {
  member: User,
  programme: Trophy,
  user: ShieldCheck,
  coach: Users,
  invoice: Receipt,
  assessment: CalendarCheck,
  session: Calendar,
  event: Star,
  level: Layers,
  module: BookOpen,
  venue: MapPin,
}

const GROUP_LABELS: Record<SearchResult["type"], string> = {
  member: "Members",
  programme: "Programmes",
  user: "Users",
  coach: "Coaches",
  invoice: "Invoices",
  assessment: "Assessments",
  session: "Sessions",
  event: "Events",
  level: "Levels",
  module: "Curriculum",
  venue: "Venues",
}

const GROUP_ORDER: SearchResult["type"][] = [
  "member",
  "programme",
  "session",
  "invoice",
  "assessment",
  "user",
  "coach",
  "event",
  "level",
  "module",
  "venue",
]

export function SearchPage({ role }: { role: "parent" | "coach" | "admin" }) {
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get("q") ?? "")

  const { data: results, isLoading } = useGlobalSearch(query, role, 50)

  const grouped = (results ?? []).reduce<Record<string, SearchResult[]>>(
    (acc, r) => {
      acc[r.type] = acc[r.type] ?? []
      acc[r.type].push(r)
      return acc
    },
    {}
  )

  const hasQuery = query.trim().length > 1
  const hasResults = (results ?? []).length > 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Search"
        description="Search across members, programmes, and more"
      />

      {/* Search input */}
      <div className="group relative max-w-xl">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground"
          strokeWidth={1.75}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search programmes, golfers, sessions…"
          autoFocus
          className="h-11 w-full rounded-lg border border-border bg-input pr-3.5 pl-10 text-sm text-foreground shadow-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground/20 focus-visible:ring-0 focus-visible:outline-none"
        />
      </div>

      {/* Loading */}
      {isLoading && hasQuery && (
        <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && hasQuery && !hasResults && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
            <Search
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              No results
            </span>
            <span className="text-xs text-muted-foreground">
              Nothing matched &ldquo;{query}&rdquo;. Try a different term.
            </span>
          </div>
        </div>
      )}

      {/* No query yet */}
      {!hasQuery && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
            <Search
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              Start typing
            </span>
            <span className="text-xs text-muted-foreground">
              Search for members, programmes, sessions, and more.
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && hasQuery && hasResults && (
        <div className="flex flex-col gap-6">
          {GROUP_ORDER.filter((type) => grouped[type]?.length).map((type) => {
            const items = grouped[type]
            const Icon = ICONS[type]
            return (
              <section
                key={type}
                className="overflow-hidden rounded-lg bg-card shadow"
              >
                {/* Group header */}
                <div className="flex items-center justify-between border-b border-border/60 bg-foreground/80 px-5 py-2 dark:bg-foreground">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-input">
                      <Icon
                        className="h-3.5 w-3.5 text-muted-foreground"
                        strokeWidth={1.75}
                      />
                    </div>
                    <h2 className="text-xs font-medium tracking-wider text-secondary uppercase">
                      {GROUP_LABELS[type]}
                    </h2>
                  </div>
                  <span className="rounded-md bg-input px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </div>

                {/* Items */}
                <div className="flex flex-col divide-y divide-border/60">
                  {items.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      className="group flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-accent/40"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="truncate text-xs text-muted-foreground">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        strokeWidth={1.75}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
