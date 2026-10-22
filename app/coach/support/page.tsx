"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import {
  LifeBuoy,
  Plus,
  ArrowLeft,
  Star,
  CircleDot,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  Send,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useMyTickets,
  useOpenConversation,
  useRateTicket,
  useReplyToConversation,
  useResolveMyTicket,
} from "@/hooks/shared/use-support"
import {
  STATUS_STYLE,
  TICKET_CATEGORIES,
  categoryLabel,
} from "@/lib/constants/support"
import { NewTicketDialog } from "@/components/portals/shared/support/new-ticket-dialog"

const stamp = (iso: string) => format(parseISO(iso), "d MMM yyyy, HH:mm")
const shortDate = (iso: string) => format(parseISO(iso), "d MMM")

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

// Render the icon as a component (not via a component-returning function).
function StatusIcon({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  if (status === "open")
    return <CircleDot className={className} strokeWidth={2.5} />
  if (status === "waiting")
    return <Clock className={className} strokeWidth={2.5} />
  if (status === "resolved")
    return <CheckCircle2 className={className} strokeWidth={2.5} />
  if (status === "closed")
    return <XCircle className={className} strokeWidth={2.5} />
  return <CircleDot className={className} strokeWidth={2.5} />
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status] ?? { label: status, cls: "bg-muted" }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${style.cls}`}
    >
      <StatusIcon status={status} className="h-2.5 w-2.5" />
      {style.label}
    </span>
  )
}

/* ── Ticket list ─────────────────────────────────────────────── */

function TicketList({
  onSelect,
  search,
  status,
  category,
}: {
  onSelect: (id: number) => void
  search: string
  status: string
  category: string
}) {
  const tickets = useMyTickets()

  const filtered = (tickets.data ?? []).filter((t) => {
    const matchesSearch =
      !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toString().includes(search)
    const matchesStatus = status === "all" || t.status === status
    const matchesCategory = category === "all" || t.category === category
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
      {tickets.isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={LifeBuoy}
            title={
              tickets.data?.length
                ? "No tickets match your filters"
                : "No requests yet"
            }
            description={
              tickets.data?.length
                ? "Try adjusting the filters above."
                : "Open a request and our team will reply within one working day."
            }
          />
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {filtered.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className="flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {t.unread && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                  <span className="truncate text-sm font-medium text-foreground">
                    {t.subject}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  #{t.id}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatusBadge status={t.status} />
                <span className="text-[11px] text-muted-foreground">
                  {categoryLabel(t.category)}
                </span>
                <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                  {shortDate(t.lastMessageAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Activity entry ──────────────────────────────────────────── */

type Message = {
  id: number
  kind: string
  body: string
  createdAt: string
  senderName?: string | null
  isMine: boolean
}

function ActivityEntry({ m }: { m: Message }) {
  if (m.kind === "system") {
    return (
      <li className="flex items-start gap-2.5 py-2 text-xs text-muted-foreground">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
          <span>{m.body}</span>
          <span className="tabular-nums">{stamp(m.createdAt)}</span>
        </div>
      </li>
    )
  }

  const isInternal = m.kind === "internal"
  const name = m.isMine ? "You" : (m.senderName ?? "Someone")

  return (
    <li
      className={`flex gap-3 border-b border-border/40 py-3 last:border-b-0 ${
        isInternal ? "-mx-4 bg-muted/40 px-4 sm:-mx-6 sm:px-6" : ""
      }`}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
        {initials(name)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-foreground">{name}</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {stamp(m.createdAt)}
          </span>
          {isInternal && (
            <span className="inline-flex items-center gap-1 rounded bg-background px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              <Lock className="h-2.5 w-2.5" strokeWidth={2} />
              Internal
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {m.body}
        </p>
      </div>
    </li>
  )
}

/* ── Ticket detail ───────────────────────────────────────────── */

function TicketDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const { data, isLoading, error } = useOpenConversation(id)
  const reply = useReplyToConversation()
  const resolve = useResolveMyTicket()
  const rate = useRateTicket()
  const [body, setBody] = useState("")
  const [stars, setStars] = useState(0)

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to support
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error?.message ?? "Could not load this ticket"}
        </div>
      </div>
    )
  }

  const finished = data.status === "resolved" || data.status === "closed"

  const firstReplyIndex = data.messages.findIndex(
    (m) => m.kind !== "system" && !m.isMine
  )
  const original =
    firstReplyIndex >= 0 ? data.messages[firstReplyIndex] : undefined
  const afterOriginal =
    firstReplyIndex >= 0 ? data.messages.slice(firstReplyIndex + 1) : []

  async function send() {
    const text = body.trim()
    if (!text || reply.isPending) return
    try {
      await reply.mutateAsync({ id, body: text })
      setBody("")
    } catch {
      /* caller keeps the text */
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3">
      {/* Back link */}
      <div className="shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to support
        </Button>
      </div>

      {/* Ticket surface */}
      <div className="flex max-h-[76vh] min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-border/60 bg-card">
        {/* Header (fixed) */}
        <div className="shrink-0 border-b border-border/60 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Ticket #{data.id}
            </span>
            <StatusBadge status={data.status} />
            <span className="text-[11px] text-muted-foreground">
              {categoryLabel(data.category)}
            </span>
          </div>
          <div className="mt-1 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {data.subject}
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Opened {stamp(data.createdAt)}
              </p>
            </div>
            {!finished && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 shrink-0 gap-1.5 text-xs"
                disabled={resolve.isPending}
                onClick={() => resolve.mutate(id)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Mark resolved</span>
                <span className="sm:hidden">Resolve</span>
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable middle */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {original && (
            <div className="border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-foreground">
                  {initials(original.senderName ?? "?")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {original.senderName ?? "Requester"}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {stamp(original.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {original.body}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Activity
              </h2>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {afterOriginal.filter((m) => m.kind !== "system").length}{" "}
                replies
              </span>
            </div>

            {afterOriginal.length === 0 ? (
              <p className="text-sm text-muted-foreground">No replies yet.</p>
            ) : (
              <ol className="flex flex-col">
                {afterOriginal.map((m) => (
                  <ActivityEntry key={m.id} m={m as Message} />
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Composer (fixed at bottom) */}
        {data.canReply ? (
          <div className="shrink-0 border-t border-border/60 bg-card px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-2">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={2}
                maxLength={4000}
                placeholder="Write a reply…"
                aria-label="Reply"
                className="resize-none"
              />
              {reply.error && (
                <p className="text-xs text-destructive">
                  {reply.error.message}
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {body.length}/4000
                </span>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  disabled={!body.trim() || reply.isPending}
                  onClick={send}
                >
                  <Send className="h-3 w-3" strokeWidth={2} />
                  {reply.isPending ? "Sending…" : "Send reply"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="shrink-0 border-t border-border/60 bg-card px-4 py-3 sm:px-6">
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              {data.replyBlockedReason ??
                "This ticket is no longer accepting replies."}
            </p>
          </div>
        )}

        {/* Rating */}
        {finished && data.rating === null && (
          <div className="shrink-0 border-t border-border/60 bg-card px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-foreground">
                  How did we do?
                </p>
                <p className="text-xs text-muted-foreground">
                  Rate the resolution of this ticket.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex gap-1"
                  role="radiogroup"
                  aria-label="Rating"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={stars === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onClick={() => setStars(n)}
                      className="rounded p-0.5 transition-colors hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          n <= stars
                            ? "fill-foreground text-foreground"
                            : "text-muted-foreground"
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  disabled={!stars || rate.isPending}
                  onClick={() => rate.mutate({ id, rating: stars })}
                >
                  {rate.isPending ? "Sending…" : "Submit"}
                </Button>
              </div>
            </div>
            {rate.error && (
              <p className="mt-2 text-xs text-destructive">
                {rate.error.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────── */

export default function SupportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null
  const [newTicket, setNewTicket] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchInput, setSearchInput] = useState("")

  const newTicketButton = (
    <Button
      variant="secondary"
      size="sm"
      className="h-9 gap-1.5 text-xs"
      onClick={() => setNewTicket(true)}
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      New request
    </Button>
  )

  /* Detail view */
  if (id !== null) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="max-w-8xl mx-auto flex min-h-0 w-full flex-1 flex-col p-3 sm:p-4">
          <TicketDetail id={id} onBack={() => router.push("/support")} />
        </div>

        {newTicket && (
          <NewTicketDialog
            open={newTicket}
            onClose={() => setNewTicket(false)}
            onCreated={(newId) => router.push(`/support?id=${newId}`)}
          />
        )}
      </div>
    )
  }

  /* List view */
  return (
    <div className="max-w-8xl mx-auto flex h-full w-full flex-col gap-6">
      <PageHeader
        title="Support"
        description="Your requests and replies"
        action={newTicketButton}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search subject or ticket #"
            aria-label="Search tickets"
            className="h-9 pl-9 text-sm"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="h-9 w-full text-xs sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_STYLE).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v ?? "all")}
        >
          <SelectTrigger className="h-9 w-full text-xs sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {TICKET_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(statusFilter !== "all" ||
          categoryFilter !== "all" ||
          searchInput) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("all")
              setCategoryFilter("all")
              setSearchInput("")
            }}
            className="h-9 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-3 w-3" strokeWidth={1.75} />
            Clear
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <TicketList
          onSelect={(tid) => router.push(`/support?id=${tid}`)}
          search={searchInput}
          status={statusFilter}
          category={categoryFilter}
        />
      </div>

      {newTicket && (
        <NewTicketDialog
          open={newTicket}
          onClose={() => setNewTicket(false)}
          onCreated={(newId) => router.push(`/support?id=${newId}`)}
        />
      )}
    </div>
  )
}
