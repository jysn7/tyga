"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

type Topic = {
  id: string
  title: string
  summary: string
  image: string
  steps: { heading: string; body: string }[]
}

const TOPICS: Topic[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    summary: "Your home base — a snapshot of what needs your attention.",
    image: "/help/dashboard.png",
    steps: [
      {
        heading: "Upcoming sessions",
        body: "The top card lists every session scheduled in the next 14 days, grouped by programme. Click any row to jump straight to the session detail.",
      },
      {
        heading: "Recent enrollments",
        body: "New sign-ups appear here in real time. Use this to spot gaps in capacity or reach out to new families.",
      },
      {
        heading: "Quick actions",
        body: "Use the shortcut buttons on the right to enrol a golfer, generate sessions, or invite a coach without leaving the page.",
      },
    ],
  },
  {
    id: "sessions",
    title: "Sessions",
    summary: "Generate, edit, and staff recurring sessions for a programme.",
    image: "/help/sessions.png",
    steps: [
      {
        heading: "Generate a block",
        body: "Open the Sessions modal, switch to the Generate tab, pick the days of the week, a time window, and a date range. The system creates one row per occurrence.",
      },
      {
        heading: "Edit a single session",
        body: "Click the pencil icon on any row to change its date, time, or status. Cancelled sessions stay visible but are greyed out.",
      },
      {
        heading: "Assign coaches",
        body: "Expand the chevron on a session to assign a coach and set their role (lead, assistant, volunteer). You can remove a coach at any time.",
      },
    ],
  },
  {
    id: "golfers",
    title: "Golfers",
    summary: "Manage profiles, guardians, and enrollment history.",
    image: "/help/golfers.png",
    steps: [
      {
        heading: "Add a golfer",
        body: "Click New golfer, fill in the profile, and link a guardian account. Guardians receive an invite email to activate their login.",
      },
      {
        heading: "Edit details",
        body: "Open a golfer's page to update contact info, medical notes, or the level they're currently working at.",
      },
      {
        heading: "Enrollment history",
        body: "Every programme a golfer has been enrolled in is listed at the bottom, with term dates and attendance summary.",
      },
    ],
  },
  {
    id: "programmes",
    title: "Programmes",
    summary: "Browse, filter, and enrol into term-based programmes.",
    image: "/help/programmes.png",
    steps: [
      {
        heading: "Filter by member",
        body: "Use the dropdown in the page header to switch between all programmes and programmes your child is eligible for.",
      },
      {
        heading: "Check capacity",
        body: "Each card shows spots left. Programmes with two or fewer spots highlight in orange; full programmes disable the enrol button.",
      },
      {
        heading: "Enrol",
        body: "Click Enrol to open the enrollment form. Once submitted, the golfer appears under the programme's roster immediately.",
      },
    ],
  },
  {
    id: "curriculum",
    title: "Curriculum",
    summary: "Understand levels, focus areas, and upgrade criteria.",
    image: "/help/curriculum.png",
    steps: [
      {
        heading: "Levels",
        body: "Each level has a goal, a focus summary, and a set of upgrade criteria. Levels are ordered by the sort order shown in admin.",
      },
      {
        heading: "Modules",
        body: "Curriculum modules are the building blocks taught at a level. A programme can draw from one or more modules.",
      },
      {
        heading: "Promotion",
        body: "When a coach marks a golfer as ready, they move to the next level. You can review the upgrade criteria from the golfer's profile.",
      },
    ],
  },
]

export function HelpModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [query, setQuery] = useState("")
  const [index, setIndex] = useState(0)

  const q = query.trim().toLowerCase()
  const filtered = q
    ? TOPICS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.steps.some(
            (s) =>
              s.heading.toLowerCase().includes(q) ||
              s.body.toLowerCase().includes(q)
          )
      )
    : TOPICS

  const safeIndex = Math.min(index, Math.max(filtered.length - 1, 0))
  const current = filtered[safeIndex]

  function go(delta: number) {
    if (filtered.length === 0) return
    setIndex((prev) => {
      const next = prev + delta
      if (next < 0) return filtered.length - 1
      if (next >= filtered.length) return 0
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 shadow-2xl ring-0 sm:w-full sm:max-w-2xl lg:max-w-4xl [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="flex shrink-0 flex-col gap-3 space-y-0 border-b border-border/60 px-4 py-3 text-left sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <DialogTitle className="truncate text-sm font-semibold tracking-tight text-foreground">
                Help &amp; guidance
              </DialogTitle>
              <span className="truncate text-[11px] text-muted-foreground">
                Browse a topic to see how it works
              </span>
            </div>

            <DialogClose
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </DialogClose>
          </div>

          {/* Search */}
          <div className="relative w-full shrink-0 sm:ml-auto sm:w-56 sm:max-w-[45%]">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIndex(0)
              }}
              placeholder="Search…"
              className="h-9 w-full rounded-lg border border-border bg-input pr-3 pl-8 text-xs text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none sm:h-8"
            />
          </div>

          {/* Desktop close */}
          <DialogClose
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </DialogClose>
        </DialogHeader>

        {/* Carousel */}
        {filtered.length === 0 || !current ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No topics match “{query}”.
          </p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Image */}
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden border-b border-border/60 bg-input sm:aspect-[21/9]">
              <Image
                key={current.id}
                src={current.image}
                alt={`${current.title} preview`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 672px, 896px"
                className="object-cover"
                priority
              />

              <button
                type="button"
                onClick={() => go(-1)}
                title="Previous"
                className="absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow backdrop-blur transition-colors hover:bg-card sm:left-3"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                title="Next"
                className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow backdrop-blur transition-colors hover:bg-card sm:right-3"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Body — scrolls independently */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-1 pb-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {current.title}
                  </h3>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {safeIndex + 1} / {filtered.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {current.summary}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {current.steps.map((s, i) => (
                  <div key={s.heading} className="flex gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-input text-[10px] font-medium text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {s.heading}
                      </span>
                      <span className="text-xs leading-relaxed text-muted-foreground">
                        {s.body}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div className="flex shrink-0 items-center justify-center gap-1.5 border-t border-border/60 px-4 py-2.5 sm:px-5">
              {filtered.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  title={t.title}
                  className={`h-1.5 rounded-full transition-all ${
                    i === safeIndex
                      ? "w-5 bg-foreground"
                      : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
