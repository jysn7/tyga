"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  SearchX,
  Layers,
  BookOpen,
  MapPin,
} from "lucide-react"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

const SEARCH_PATHS = {
  parent: "/search",
  coach: "/coach/search",
  admin: "/admin/search",
} as const

export function GlobalSearch({ role }: { role: "parent" | "coach" | "admin" }) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { data: results, isLoading } = useGlobalSearch(query, role)

  const grouped = (results ?? []).reduce<Record<string, SearchResult[]>>(
    (acc, r) => {
      acc[r.type] = acc[r.type] ?? []
      acc[r.type].push(r)
      return acc
    },
    {}
  )

  function handleSelect(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  const hasQuery = query.trim().length > 1
  const hasResults = (results ?? []).length > 0
  const showLoading = isLoading && hasQuery
  const showEmpty = !isLoading && hasQuery && !hasResults
  const showResults = !isLoading && hasQuery && hasResults

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        nativeButton={false}
        onClickCapture={(e) => e.stopPropagation()}
        render={
          <div className="group relative w-full max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground"
              strokeWidth={1.75}
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (!open) setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search programmes, golfers, sessions…"
              className="h-9 w-full rounded-lg border border-border bg-input pr-3.5 pl-9 text-sm text-foreground shadow-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/20 focus-visible:ring-1 focus-visible:outline-primary md:max-w-108"
            />
          </div>
        }
      />

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-1.5rem)] min-w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl border border-border/60 bg-popover p-0 shadow-lg sm:min-w-[28rem]"
      >
        <Command shouldFilter={false} className="bg-transparent">
          <CommandList className="max-h-96 overflow-y-auto p-1.5">
            {showLoading && (
              <p className="px-4 py-5 text-center text-xs text-muted-foreground">
                Searching…
              </p>
            )}

            {showEmpty && (
              <div className="flex w-full flex-col items-center gap-2.5 px-4 py-8 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-input">
                  <SearchX
                    className="h-4 w-4 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-foreground">
                    No results
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Nothing matched &ldquo;{query}&rdquo;
                  </span>
                </div>
              </div>
            )}

            {showResults &&
              GROUP_ORDER.filter((type) => grouped[type]?.length).map(
                (type) => {
                  const items = grouped[type]
                  const Icon = ICONS[type]
                  return (
                    <CommandGroup
                      key={type}
                      heading={GROUP_LABELS[type]}
                      className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
                    >
                      <div className="flex flex-col gap-px">
                        {items.map((item) => (
                          <CommandItem
                            key={`${item.type}-${item.id}`}
                            onSelect={() => handleSelect(item.href)}
                            className="group flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors data-[selected=true]:bg-accent"
                          >
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-input">
                              <Icon
                                className="h-3 w-3 text-muted-foreground"
                                strokeWidth={1.75}
                              />
                            </div>
                            <div className="flex min-w-0 flex-1 items-baseline gap-2">
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
                              className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100"
                              strokeWidth={1.75}
                            />
                          </CommandItem>
                        ))}
                      </div>
                    </CommandGroup>
                  )
                }
              )}

            {hasQuery && (
              <div className="mt-1.5 border-t border-border/60 px-1 pt-1.5">
                <CommandItem
                  onSelect={() =>
                    handleSelect(
                      `${SEARCH_PATHS[role]}?q=${encodeURIComponent(query)}`
                    )
                  }
                  className="group flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-input px-3 py-2 text-foreground transition-colors data-[selected=true]:bg-accent"
                >
                  <span className="text-xs font-medium">
                    See all results for &ldquo;{query}&rdquo;
                  </span>
                  <ArrowRight
                    className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-data-[selected=true]:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </CommandItem>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
