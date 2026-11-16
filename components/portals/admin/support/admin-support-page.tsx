"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Inbox, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import {
  ADMIN_PAGE_SIZE,
  useAdminConversation,
  useAdminReply,
  useAdminStaff,
  useAdminTickets,
  useTicketSummary,
  useUpdateTicket,
  type TicketPriority,
  type TicketStatus,
} from "@/hooks/shared/use-support"
import {
  CANNED_REPLIES,
  PRIORITY_STYLE,
  STATUS_STYLE,
  TICKET_CATEGORIES,
  categoryLabel,
} from "@/lib/constants/support"

const ago = (iso: string) =>
  formatDistanceToNow(parseISO(iso), { addSuffix: true })

const stamp = (iso: string) =>
  new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parseISO(iso))

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

type ThreadMessage = {
  id: number
  kind: string
  body: string
  createdAt: string
  senderName?: string | null
  isMine: boolean
}

function Pill({ label, cls }: { label: string; cls: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${cls}`}
    >
      {label}
    </span>
  )
}

function useDebounced<T>(v: T, ms = 300) {
  const [d, setD] = useState(v)
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms)
    return () => clearTimeout(t)
  }, [v, ms])
  return d
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <p
        className={`text-lg leading-none font-semibold tabular-nums ${accent}`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function ActivityEntry({ m }: { m: ThreadMessage }) {
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
        isInternal ? "-mx-4 bg-muted/40 px-4" : ""
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
            <Pill label="Internal" cls="bg-background text-muted-foreground" />
          )}
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {m.body}
        </p>
      </div>
    </li>
  )
}

function TicketDetail({
  id,
  onClose,
}: {
  id: number | null
  onClose: () => void
}) {
  const { data, isLoading, error } = useAdminConversation(id)
  const reply = useAdminReply()
  const update = useUpdateTicket()
  const { data: staff = [] } = useAdminStaff()
  const [body, setBody] = useState("")

  const isDirect = data?.kind === "direct"

  if (!id) return null

  async function send() {
    if (!data || !body.trim() || reply.isPending) return
    try {
      await reply.mutateAsync({
        id: data.id,
        body: body.trim(),
        internal: isDirect ? true : false,
        resolve: false,
      })
      setBody("")
    } catch {
      /* keep the text */
    }
  }

  return (
    <SidePanel
      open={id !== null}
      onOpenChange={(o) => !o && onClose()}
      title={data ? `#${data.id} · ${data.subject}` : "Ticket"}
      description={
        data
          ? `${categoryLabel(data.category)} · opened ${ago(data.createdAt)}`
          : undefined
      }
      header={
        data && (
          <div className="flex flex-col gap-3 border-b border-border/60 px-8 pt-8 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Ticket #{data.id}
              </span>
              <Pill
                {...(STATUS_STYLE[data.status] ?? {
                  label: data.status,
                  cls: "bg-muted",
                })}
              />
              <Pill
                {...(PRIORITY_STYLE[data.priority] ?? {
                  label: data.priority,
                  cls: "bg-muted",
                })}
              />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {data.subject}
            </h2>
            <p className="text-xs text-muted-foreground">
              {categoryLabel(data.category)} · opened {stamp(data.createdAt)}
            </p>
          </div>
        )
      }
    >
      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <Loader />
        </div>
      )}

      {error && (
        <div className="m-4 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error.message}
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-4 px-6 pb-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                {isDirect ? "Between" : "From"}
              </p>
              {isDirect ? (
                data.participants.map((p) => (
                  <p
                    key={p.accountId}
                    className="mt-0.5 text-sm text-foreground"
                  >
                    {p.name}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({p.role})
                    </span>
                  </p>
                ))
              ) : (
                <>
                  <p className="mt-0.5 text-sm text-foreground">
                    {data.requester.name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.requester.email}
                  </p>
                  {data.requester.phone && (
                    <p className="text-xs text-muted-foreground">
                      {data.requester.phone}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {data.source === "public_form"
                      ? "Website form · no account"
                      : "Signed in"}
                  </p>
                </>
              )}
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                Context
              </p>
              <p className="mt-0.5 text-sm text-foreground">
                {data.member?.name ?? "No child linked"}
              </p>
              {data.programme && (
                <p className="text-xs text-muted-foreground">
                  {data.programme.name}
                </p>
              )}
              {data.rating && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Rated {data.rating}/5
                  {data.ratingComment ? `: “${data.ratingComment}”` : ""}
                </p>
              )}
            </div>
          </div>

          {isDirect ? (
            <div className="rounded-lg border border-border/60 bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              Safeguarding view: you can read this and add private notes, but
              only the two participants can reply.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  Status
                </span>
                <Select
                  value={data.status}
                  onValueChange={(v) =>
                    update.mutate({
                      id: data.id,
                      patch: { status: v as TicketStatus },
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue>
                      {STATUS_STYLE[data.status]?.label ?? data.status}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_STYLE).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  Priority
                </span>
                <Select
                  value={data.priority}
                  onValueChange={(v) =>
                    update.mutate({
                      id: data.id,
                      patch: { priority: v as TicketPriority },
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue>
                      {PRIORITY_STYLE[data.priority]?.label ?? data.priority}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_STYLE).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  Assigned to
                </span>
                <Select
                  value={data.assignedTo ?? "none"}
                  onValueChange={(v) =>
                    update.mutate({
                      id: data.id,
                      patch: {
                        assigned_to: !v || v === "none" ? null : v,
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue>
                      {staff.find((s) => s.id === data.assignedTo)?.name ??
                        "Unassigned"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          )}

          {update.error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {update.error.message}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Activity
            </h3>
            <div className="rounded-lg border border-border/60 bg-card px-3">
              {data.messages.length === 0 ? (
                <p className="py-4 text-xs text-muted-foreground">
                  No activity yet.
                </p>
              ) : (
                <ol className="flex flex-col">
                  {data.messages.map((m) => (
                    <ActivityEntry key={m.id} m={m as ThreadMessage} />
                  ))}
                </ol>
              )}
            </div>
          </div>

          {isDirect && data.status === "closed" ? (
            <div className="rounded-lg border border-border/60 bg-muted px-3 py-2 text-xs text-muted-foreground">
              This conversation is closed. Reopen it to reply.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {CANNED_REPLIES.map((c) => (
                  <button
                    key={c.title}
                    type="button"
                    onClick={() => setBody(c.body)}
                    className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-accent/40 hover:text-foreground"
                  >
                    {c.title}
                  </button>
                ))}
              </div>

              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={3}
                maxLength={4000}
                placeholder={
                  isDirect ? "Add a private note…" : "Reply to the requester…"
                }
                className="resize-none"
              />

              {reply.error && (
                <p role="alert" className="text-xs text-destructive">
                  {reply.error.message}
                </p>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {body.length}/4000
                </span>
                <div className="flex gap-2">
                  {isDirect && data.status !== "closed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 border-destructive/50 text-xs text-destructive hover:bg-destructive/10"
                      disabled={update.isPending}
                      onClick={() =>
                        update.mutate({
                          id: data.id,
                          patch: { status: "closed" },
                        })
                      }
                    >
                      Close conversation
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    disabled={!body.trim() || reply.isPending}
                    onClick={send}
                  >
                    {reply.isPending
                      ? "Sending…"
                      : isDirect
                        ? "Add note"
                        : "Send reply"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </SidePanel>
  )
}

export function AdminSupportPage() {
  const [kind, setKind] = useState<"ticket" | "direct">("ticket")
  const [status, setStatus] = useState<TicketStatus | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [assigned, setAssigned] = useState<"me" | "unassigned" | null>(null)
  const [needsReply, setNeedsReply] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const search = useDebounced(searchInput)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  function handleSearchChange(v: string) {
    setSearchInput(v)
    setPage(0)
  }

  const { data: s } = useTicketSummary()
  const {
    data: rows = [],
    isLoading,
    error,
  } = useAdminTickets({
    kind,
    status,
    category,
    assigned,
    search,
    needsReply,
    page,
  })
  const total = rows[0]?.totalCount ?? 0
  const from = total === 0 ? 0 : page * ADMIN_PAGE_SIZE + 1
  const to = Math.min((page + 1) * ADMIN_PAGE_SIZE, total)
  const reset = () => setPage(0)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Tile
          label="Needs a reply"
          value={s?.needs_reply ?? "–"}
          accent="text-red"
        />
        <Tile
          label="Unassigned"
          value={s?.unassigned ?? "–"}
          accent="text-yellow"
        />
        <Tile
          label="Overdue 24h+"
          value={s?.overdue ?? "–"}
          accent="text-orange"
        />
        <Tile
          label="Resolved this week"
          value={s?.resolved_7d ?? "–"}
          accent="text-green"
        />
        <Tile
          label="Avg first reply"
          value={
            s?.avg_first_response_hours != null
              ? `${s.avg_first_response_hours}h`
              : "–"
          }
          accent="text-blue"
        />
        <Tile
          label="Avg rating"
          value={s?.avg_rating != null ? `${s.avg_rating}/5` : "–"}
          accent="text-purple"
        />
      </div>

      {/* Segmented tabs — matches the app's tab style */}
      <div className="flex w-fit gap-1 rounded-lg bg-input p-1">
        {(
          [
            ["ticket", "Support tickets"],
            ["direct", "Direct messages"],
          ] as const
        ).map(([k, label]) => {
          const active = kind === k
          return (
            <button
              key={k}
              type="button"
              onClick={() => {
                setKind(k)
                setStatus(null)
                setNeedsReply(false)
                reset()
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <Input
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search ticket or person"
            aria-label="Search"
            className="h-9 pl-9 text-sm"
          />
        </div>

        <Select
          value={status ?? "all"}
          onValueChange={(v) => {
            setStatus(!v || v === "all" ? null : (v as TicketStatus))
            reset()
          }}
        >
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue>
              {status ? STATUS_STYLE[status].label : "Any status"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            {Object.entries(STATUS_STYLE).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {kind === "ticket" && (
          <>
            <Select
              value={category ?? "all"}
              onValueChange={(v) => {
                setCategory(!v || v === "all" ? null : v)
                reset()
              }}
            >
              <SelectTrigger className="h-9 w-48 text-sm">
                <SelectValue>
                  {category ? categoryLabel(category) : "Any topic"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any topic</SelectItem>
                {TICKET_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={assigned ?? "all"}
              onValueChange={(v) => {
                setAssigned(
                  !v || v === "all" ? null : (v as "me" | "unassigned")
                )
                reset()
              }}
            >
              <SelectTrigger className="h-9 w-36 text-sm">
                <SelectValue>
                  {assigned === "me"
                    ? "Mine"
                    : assigned === "unassigned"
                      ? "Unassigned"
                      : "Anyone"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Anyone</SelectItem>
                <SelectItem value="me">Mine</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={needsReply}
                onChange={(e) => {
                  setNeedsReply(e.target.checked)
                  reset()
                }}
                className="h-3 w-3 accent-primary"
              />
              Needs a reply
            </label>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No tickets found"
          description="No tickets match these filters."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/80 text-[11px] tracking-wider text-secondary uppercase dark:bg-foreground">
                  <th className="px-4 py-2.5 font-medium">#</th>
                  <th className="px-4 py-2.5 font-medium">
                    {kind === "ticket" ? "From" : "Between"}
                  </th>
                  <th className="px-4 py-2.5 font-medium">Subject</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Assigned</th>
                  <th className="px-4 py-2.5 font-medium">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    tabIndex={0}
                    onClick={() => setSelected(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelected(r.id)
                      }
                    }}
                    className="cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                  >
                    <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums">
                      {r.id}
                    </td>
                    <td className="px-4 py-2.5 text-foreground">
                      {r.requesterName ?? "—"}
                    </td>
                    <td className="max-w-[320px] px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {r.priority === "urgent" && (
                          <Pill label="Urgent" cls="bg-red-light" />
                        )}
                        <span className="truncate text-sm text-foreground">
                          {r.subject}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.preview}
                      </p>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Pill
                          {...(STATUS_STYLE[r.status] ?? {
                            label: r.status,
                            cls: "bg-muted",
                          })}
                        />
                        {r.needsReply && (
                          <Pill label="Reply due" cls="bg-red-light" />
                        )}
                        {r.overdue && (
                          <Pill label="Overdue" cls="bg-orange-light" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {r.assignedName ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {ago(r.lastMessageAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              {from}–{to} of {total}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Previous page"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Next page"
                disabled={to >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </div>
      )}

      <TicketDetail
        key={selected ?? "none"}
        id={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
