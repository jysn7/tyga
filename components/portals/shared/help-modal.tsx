"use client"

import { useMemo, useState } from "react"
import { Search, X, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { useAppStore, type Role } from "@/stores/useAppStore"

type Topic = {
  id: string
  title: string
  summary: string
  roles: Role[]
  steps: { heading: string; body: string }[]
}

const ALL: Role[] = ["parent", "coach", "admin"]

const TOPICS: Topic[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    summary: "Your home base — a snapshot of what needs your attention.",
    roles: ALL,
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
    roles: ["coach", "admin"],
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
    roles: ALL,
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
    roles: ALL,
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
    roles: ALL,
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
  {
    id: "membership",
    title: "Membership",
    summary: "Set up, manage, and cancel your academy membership.",
    roles: ["parent"],
    steps: [
      {
        heading: "Why membership matters",
        body: "An active membership unlocks enrolment in every programme. Without one, the programme cards show a lock icon and the enrol button is disabled.",
      },
      {
        heading: "Set up a card subscription",
        body: "Open Billing → Membership, click Set up membership, and complete the Paystack checkout. Membership activates as soon as the first payment clears.",
      },
      {
        heading: "Cancel or update your card",
        body: "From the same page, you can cancel (access continues until the end of the paid period) or update your card if a charge fails.",
      },
    ],
  },
  {
    id: "waitlist",
    title: "Waiting lists",
    summary: "Join a queue when a programme is full, and manage your position.",
    roles: ["parent"],
    steps: [
      {
        heading: "Join a waiting list",
        body: "When a programme is full, the Enrol button becomes Join waitlist. Pick the child, confirm, and you'll see your position in the queue.",
      },
      {
        heading: "When a place opens",
        body: "We notify you as soon as a spot becomes available. You have 48 hours to enrol and pay before the place is offered to the next family.",
      },
      {
        heading: "Manage your entries",
        body: "Everything you're waiting on is listed at Dashboard → Waiting lists. You can leave a queue from there at any time.",
      },
    ],
  },
  {
    id: "refunds",
    title: "Refunds",
    summary: "What happens when you withdraw from a paid enrolment.",
    roles: ["parent", "admin"],
    steps: [
      {
        heading: "Withdrawing",
        body: "Open your child's profile, go to Enrolled programmes, and click Withdraw. You'll be asked for a reason — this is kept internal.",
      },
      {
        heading: "Paid vs unpaid invoices",
        body: "If the invoice is unpaid, it's cancelled immediately. If it's already paid, a refund review opens for the academy to decide on.",
      },
      {
        heading: "Outcome",
        body: "Once the academy resolves the review, you receive a notification with the decision. Refunds are processed back to the original payment method.",
      },
    ],
  },
  {
    id: "tickets",
    title: "Support tickets",
    summary: "Raise a request and follow its progress.",
    roles: ALL,
    steps: [
      {
        heading: "Open a ticket",
        body: "Go to Support, choose a topic, and describe what you need. Safeguarding concerns are automatically escalated to urgent.",
      },
      {
        heading: "Track the status",
        body: "Tickets move through Open → Waiting → Resolved → Closed. You'll be notified every time an admin replies.",
      },
      {
        heading: "Reopen or close",
        body: "Reply on a resolved ticket to reopen it, or mark it resolved yourself if the issue is sorted. You can also rate the outcome once resolved.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Account & security",
    summary: "Manage your profile, password, and two-factor authentication.",
    roles: ALL,
    steps: [
      {
        heading: "Profile details",
        body: "Update your name, phone, and address from Settings. Changes take effect immediately across the portal.",
      },
      {
        heading: "Password",
        body: "Use the Sign-in & security section to change your password. If you're signed in on other devices, you can end those sessions from the same page.",
      },
      {
        heading: "Two-factor authentication",
        body: "Coaches and administrators must enrol an authenticator app. Parents can enable it too — recommended, but optional.",
      },
    ],
  },
  {
    id: "admin-enrolments",
    title: "Admin — Enrolments",
    summary: "Activate, pause, withdraw, and resolve refunds.",
    roles: ["admin"],
    steps: [
      {
        heading: "Change status",
        body: "Open an enrolment from the Enrolments table and use the action menu. Activating a pending enrolment reserves the child's place.",
      },
      {
        heading: "Refund reviews",
        body: "Any paid enrolment that withdraws opens a refund review. Resolve it from the Enrolments page or from the child's profile.",
      },
      {
        heading: "Bulk actions",
        body: "Filter by programme and status to see a cohort, then select multiple rows to pause, withdraw, or complete in one action.",
      },
    ],
  },
  {
    id: "admin-finance",
    title: "Admin — Finance",
    summary: "Invoices, payments, and the refund queue.",
    roles: ["admin"],
    steps: [
      {
        heading: "Recording a manual payment",
        body: "Open an unpaid invoice and click Record payment. Choose EFT, cash, or other, and enter a reference. The payment applies immediately.",
      },
      {
        heading: "Refund queue",
        body: "Every unresolved refund review appears in Finance → Refunds. Resolving one closes the review, marks the payment refunded, and notifies the parent.",
      },
      {
        heading: "Monthly totals",
        body: "The finance overview shows revenue, outstanding balances, and membership income side by side so you can reconcile in one place.",
      },
    ],
  },
  {
    id: "admin-waitlists",
    title: "Admin — Waiting lists",
    summary: "See who's waiting and carry them into the next term.",
    roles: ["admin"],
    steps: [
      {
        heading: "Where to find them",
        body: "Open Programmes → Roll over. Each programme with a waitlist shows a count badge. Click it to see the full queue with contact details.",
      },
      {
        heading: "When a place opens",
        body: "Withdrawing or pausing an active enrolment triggers the waitlist automatically — the next family is notified and given 48 hours to act.",
      },
      {
        heading: "Rollover",
        body: "When a term ends, rolling over to the next term carries the waitlist with it if the admin chooses. The queue order is preserved.",
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
  const account = useAppStore((s) => s.account)
  const role: Role = account?.role ?? "parent"

  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const roleTopics = useMemo(
    () => TOPICS.filter((t) => t.roles.includes(role)),
    [role]
  )

  const q = query.trim().toLowerCase()
  const filtered = q
    ? roleTopics.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.steps.some(
            (s) =>
              s.heading.toLowerCase().includes(q) ||
              s.body.toLowerCase().includes(q)
          )
      )
    : roleTopics

  const selected =
    filtered.find((t) => t.id === selectedId) ?? filtered[0] ?? null

  function handleSelect(id: string) {
    setSelectedId(id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 shadow-2xl ring-0 sm:w-full sm:max-w-4xl [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="flex shrink-0 flex-col gap-4 border-b border-border/60 px-4 py-4 text-left sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                Help &amp; guidance
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
                Step-by-step guides for getting the most out of the portal.
              </DialogDescription>
            </div>

            <DialogClose
              className="-mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </DialogClose>
          </div>

          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics…"
              aria-label="Search help topics"
              className="h-10 w-full rounded-xl border border-border bg-input pr-10 pl-9 text-sm text-foreground shadow-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 focus-visible:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </DialogHeader>

        {filtered.length === 0 || !selected ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">
              No topics match &ldquo;{query}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            {/* Topic list — sidebar on desktop, scrollable strip on mobile */}
            <nav className="shrink-0 border-b border-border/60 sm:w-64 sm:border-r sm:border-b-0">
              <ul className="flex gap-1 overflow-x-auto p-2 sm:flex-col sm:overflow-visible sm:overflow-y-auto">
                {filtered.map((t) => {
                  const isActive = t.id === selected.id
                  return (
                    <li key={t.id} className="shrink-0 sm:shrink">
                      <button
                        type="button"
                        onClick={() => handleSelect(t.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors ${
                          isActive
                            ? "bg-accent font-medium text-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        }`}
                      >
                        <span className="truncate whitespace-nowrap sm:whitespace-normal">
                          {t.title}
                        </span>
                        <ChevronRight
                          className={`hidden h-3 w-3 shrink-0 sm:block ${
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground/60"
                          }`}
                          strokeWidth={1.75}
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-1 border-b border-border/60 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {selected.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selected.summary}
                </p>
              </div>

              <div className="flex flex-col gap-4 px-4 py-4 sm:px-6">
                {selected.steps.map((s, i) => (
                  <div key={s.heading} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-input text-[11px] font-medium text-muted-foreground">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
