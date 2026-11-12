"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Field } from "@/components/portals/shared/field"
import {
  intervalWord,
  type MembershipSource,
  type MembershipStatus,
} from "@/hooks/client/use-membership"
import {
  MEMBERSHIP_PAGE_SIZE,
  useCancelCardMembership,
  useEndMembership,
  useGrantComplimentary,
  useMembershipDetail,
  useMembershipsPage,
  useMembershipSummary,
  useRecordMembershipPayment,
  useSyncMembership,
} from "@/hooks/admin/memberships/use-memberships"

const money = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n
  )
const day = (s: string | null) => (s ? format(parseISO(s), "d MMM yyyy") : "—")
const field =
  "h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
const area =
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"

const STATUS: Record<
  MembershipStatus,
  { label: string; cls: string; accent: string }
> = {
  active: { label: "Active", cls: "bg-green-light", accent: "text-green" },
  non_renewing: {
    label: "Not renewing",
    cls: "bg-yellow-light",
    accent: "text-yellow",
  },
  attention: {
    label: "Needs attention",
    cls: "bg-red-light",
    accent: "text-red",
  },
  cancelled: {
    label: "Ended",
    cls: "bg-muted",
    accent: "text-muted-foreground",
  },
  expired: {
    label: "Expired",
    cls: "bg-muted",
    accent: "text-muted-foreground",
  },
  pending: { label: "Pending", cls: "bg-blue-light", accent: "text-blue" },
}
const SOURCE: Record<MembershipSource, string> = {
  paystack: "Card",
  manual: "Paid to academy",
  complimentary: "Complimentary",
}

const Pill = ({ label, cls }: { label: string; cls: string }) => (
  <span
    className={`rounded-full px-2 py-0.5 text-[11px] font-medium text-foreground ${cls}`}
  >
    {label}
  </span>
)

function Tile({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <p
        className={`text-xl leading-none font-semibold tabular-nums ${accent}`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

type Mode = null | "pay" | "grant" | "cancel" | "end"

function Detail({
  accountId,
  onClose,
}: {
  accountId: string | null
  onClose: () => void
}) {
  const { data, isLoading, error } = useMembershipDetail(accountId)
  const sync = useSyncMembership()
  const cancelCard = useCancelCardMembership()
  const end = useEndMembership()
  const pay = useRecordMembershipPayment()
  const grant = useGrantComplimentary()

  const [mode, setMode] = useState<Mode>(null)
  const [reason, setReason] = useState("")
  const [periods, setPeriods] = useState(1)
  const [method, setMethod] = useState<"eft" | "cash" | "other">("eft")
  const [reference, setReference] = useState("")
  const [paidOn, setPaidOn] = useState("")
  const [until, setUntil] = useState("")
  const [note, setNote] = useState("")
  const [notice, setNotice] = useState<string | null>(null)

  const busy = [sync, cancelCard, end, pay, grant].some((m) => m.isPending)

  const activeMutation =
    mode === "pay"
      ? pay
      : mode === "grant"
        ? grant
        : mode === "cancel"
          ? cancelCard
          : mode === "end"
            ? end
            : null
  const err = activeMutation?.error?.message

  const cur = data?.current
  const open = !!cur?.isOpen
  const isCard = cur?.source === "paystack"

  if (accountId === null) return null

  const done = (msg: string) => {
    setMode(null)
    setReason("")
    setNote("")
    setReference("")
    setPaidOn("")
    setUntil("")
    setNotice(msg)
  }

  const needReason = reason.trim().length >= 5

  return (
    <SidePanel
      open
      onOpenChange={(o) => !o && onClose()}
      title={data?.account.fullName ?? "Membership"}
      description={data?.account.email ?? undefined}
      header={
        data && (
          <div className="flex flex-col gap-4 border-b border-border/60 px-8 pt-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-base font-semibold text-foreground">
                {initials(data.account.fullName)}
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {data.account.fullName ?? "Unnamed"}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {data.account.email}
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  {cur ? (
                    <>
                      <Pill {...STATUS[cur.status]} />
                      <Pill label={SOURCE[cur.source]} cls="bg-blue-light" />
                    </>
                  ) : (
                    <Pill label="No membership" cls="bg-muted" />
                  )}
                  <Pill
                    label={data.hasAccess ? "Can enrol" : "Cannot enrol"}
                    cls={data.hasAccess ? "bg-green-light" : "bg-orange-light"}
                  />
                </div>
              </div>
            </div>
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
        <div className="flex flex-col gap-5 px-6 pb-6">
          {notice && (
            <div className="rounded-lg border border-green/40 bg-green-light px-3 py-2 text-xs text-foreground">
              {notice}
            </div>
          )}

          {cur && (
            <div className="grid grid-cols-2 gap-3">
              {[
                [
                  "Amount",
                  cur.source === "complimentary"
                    ? "Free"
                    : `${money(cur.amount)} / ${intervalWord(cur.interval)}`,
                ],
                ["Paid until", day(cur.periodEnd)],
                ["Next charge", isCard ? day(cur.nextChargeAt) : "—"],
                ["Last payment", day(cur.lastPaymentAt)],
                ["Total paid", money(data.totalPaid)],
                ["Last failed", day(cur.lastFailedAt)],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-border/60 bg-card p-3"
                >
                  <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                    {k}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{v}</p>
                </div>
              ))}
            </div>
          )}

          {cur?.note && (
            <p className="text-xs text-muted-foreground">Note: “{cur.note}”</p>
          )}

          {isCard && open && !cur?.hasToken && (
            <div className="rounded-lg border border-yellow/40 bg-yellow-light px-3 py-2 text-xs text-foreground">
              The Paystack cancel token isn&apos;t stored for this subscription,
              so it can&apos;t be cancelled from here. Cancel it in the Paystack
              dashboard, then use Sync.
            </div>
          )}

          {mode === null && (
            <div className="flex flex-wrap gap-2">
              {isCard && open && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      sync.mutate(data.account.id, {
                        onSuccess: () => done("Synced with Paystack."),
                      })
                    }
                    className="text-xs"
                  >
                    {sync.isPending ? "Syncing…" : "Sync from Paystack"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || !cur?.hasToken}
                    onClick={() => setMode("cancel")}
                    className="text-xs"
                  >
                    Cancel subscription
                  </Button>
                </>
              )}
              {(!open || !isCard) && (
                <Button
                  size="sm"
                  onClick={() => setMode("pay")}
                  className="text-xs"
                >
                  Record payment
                </Button>
              )}
              {!open && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMode("grant")}
                  className="text-xs"
                >
                  Grant complimentary
                </Button>
              )}
              {open && !isCard && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMode("end")}
                  className="text-xs"
                >
                  End membership
                </Button>
              )}
            </div>
          )}

          {mode && (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
              {mode === "pay" && (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Record a payment made to the academy
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                      Periods paid
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={periods}
                        onChange={(e) => setPeriods(Number(e.target.value))}
                        className={field}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                      Method
                      <Select
                        value={method}
                        onValueChange={(v) =>
                          setMethod((v ?? "eft") as "eft" | "cash" | "other")
                        }
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue>
                            {
                              { eft: "EFT", cash: "Cash", other: "Other" }[
                                method
                              ]
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eft">EFT</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                      Bank reference
                      <input
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className={field}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                      Date received
                      <input
                        type="date"
                        value={paidOn}
                        onChange={(e) => setPaidOn(e.target.value)}
                        className={field}
                      />
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Note (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={area}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    The amount is the membership fee × periods. The membership
                    runs from today, or from the end of the current period.
                  </p>
                </>
              )}

              {mode === "grant" && (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Grant a complimentary membership
                  </p>
                  <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                    Until
                    <input
                      type="date"
                      value={until}
                      onChange={(e) => setUntil(e.target.value)}
                      className={field}
                    />
                  </label>
                </>
              )}

              {(mode === "cancel" || mode === "end") && (
                <p className="text-sm text-foreground">
                  {mode === "cancel"
                    ? "This stops future card charges. The parent keeps the membership until the end of the period they paid for."
                    : "This ends the membership now."}
                </p>
              )}

              {mode !== "pay" && (
                <Field label="Reason (required, at least 5 characters)">
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={300}
                    className={area}
                  />
                </Field>
              )}

              {err && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {err}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={
                    busy ||
                    (mode !== "pay" && !needReason) ||
                    (mode === "grant" && !until)
                  }
                  onClick={() => {
                    const id = data.account.id
                    if (mode === "pay")
                      pay.mutate(
                        {
                          accountId: id,
                          periods,
                          method,
                          reference: reference.trim() || undefined,
                          paidOn: paidOn || undefined,
                          amount: null,
                          note: note.trim() || undefined,
                        },
                        { onSuccess: () => done("Payment recorded.") }
                      )
                    if (mode === "grant")
                      grant.mutate(
                        { accountId: id, until, reason },
                        {
                          onSuccess: () =>
                            done("Complimentary membership granted."),
                        }
                      )
                    if (mode === "cancel")
                      cancelCard.mutate(
                        { accountId: id, reason },
                        {
                          onSuccess: () =>
                            done(
                              "The subscription was cancelled. The parent keeps access until the period ends."
                            ),
                        }
                      )
                    if (mode === "end")
                      end.mutate(
                        { accountId: id, reason },
                        { onSuccess: () => done("Membership ended.") }
                      )
                  }}
                  className="text-xs"
                >
                  {busy ? "Working…" : "Confirm"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setMode(null)}
                  className="text-xs"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-foreground">Charges</h3>
            {data.charges.length === 0 ? (
              <p className="text-xs text-muted-foreground">No charges yet.</p>
            ) : (
              data.charges.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-card p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      {money(c.amount)}{" "}
                      <span className="text-xs text-muted-foreground">
                        {day(c.paidAt)}
                        {c.periodEnd ? ` · until ${day(c.periodEnd)}` : ""}
                      </span>
                    </p>
                    <p className="text-[11px] break-all text-muted-foreground">
                      {c.source === "manual"
                        ? `${c.method ?? "manual"} · recorded by ${c.recordedBy ?? "—"} · `
                        : ""}
                      {c.reference}
                    </p>
                    {c.note && (
                      <p className="text-[11px] text-muted-foreground">
                        “{c.note}”
                      </p>
                    )}
                  </div>
                  <Pill
                    label={
                      c.status === "paid"
                        ? "Paid"
                        : c.status === "failed"
                          ? "Failed"
                          : "Refunded"
                    }
                    cls={
                      c.status === "paid"
                        ? "bg-green-light"
                        : c.status === "failed"
                          ? "bg-red-light"
                          : "bg-purple-light"
                    }
                  />
                </div>
              ))
            )}
          </section>

          {data.actions.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Admin activity
              </h3>
              <ol className="flex flex-col gap-2 border-l border-border pl-4">
                {data.actions.map((a, i) => (
                  <li key={i} className="text-xs">
                    <p className="font-medium text-foreground">
                      {a.action.replace("membership_", "").replace(/_/g, " ")}
                      {a.reason ? `: “${a.reason}”` : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {a.by ?? "System"} ·{" "}
                      {format(parseISO(a.at), "d MMM yyyy, HH:mm")}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </SidePanel>
  )
}

function initials(name: string | null) {
  return (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

export function AdminMembershipsPanel() {
  const [status, setStatus] = useState<MembershipStatus | null>(null)
  const [source, setSource] = useState<MembershipSource | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(0)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data: s } = useMembershipSummary()
  const {
    data: rows = [],
    isLoading,
    error,
  } = useMembershipsPage({ status, source, search, page })

  const total = rows[0]?.totalCount ?? 0
  const to = Math.min((page + 1) * MEMBERSHIP_PAGE_SIZE, total)
  const hasAnyFilter =
    status !== null || source !== null || search.trim() !== ""

  return (
    <div className="flex flex-col gap-6">
      {s && !s.settings.planConfigured && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/50 bg-red-light px-4 py-3 text-sm text-foreground"
        >
          No Paystack plan is set, so parents can&apos;t start a membership.{" "}
          <Link
            href="/admin/settings?tab=membership"
            className="font-medium underline"
          >
            Set it in Settings → Membership
          </Link>
          .
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Tile
          label="Active"
          value={s?.counts.active ?? "–"}
          sub={s ? `${s.counts.complimentary} complimentary` : undefined}
          accent="text-green"
        />
        <Tile
          label="Needs attention"
          value={s?.counts.attention ?? "–"}
          sub="failed or missed renewal"
          accent="text-red"
        />
        <Tile
          label="Not renewing"
          value={s?.counts.nonRenewing ?? "–"}
          sub={s ? `${s.counts.ending7d} end within 7 days` : undefined}
          accent="text-yellow"
        />
        <Tile
          label="Expected each month"
          value={s ? money(s.monthlyValue) : "–"}
          sub="card subscriptions only"
          accent="text-purple"
        />
        <Tile
          label="Received this month"
          value={s ? money(s.receivedThisMonth) : "–"}
          sub={s ? `${money(s.receivedLastMonth)} last month` : undefined}
          accent="text-blue"
        />
        <Tile
          label="Failed charges (30 days)"
          value={s?.failed30d ?? "–"}
          sub={s ? `${s.counts.ended30d} ended` : undefined}
          accent="text-orange"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search"
            aria-label="Search"
            className="h-9 w-full rounded-md border border-border bg-card pr-3 pl-9 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        <Select
          value={status ?? "all"}
          onValueChange={(v) => {
            setStatus(!v || v === "all" ? null : (v as MembershipStatus))
            setPage(0)
          }}
        >
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue>
              {status ? STATUS[status].label : "Any status"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            {(Object.keys(STATUS) as MembershipStatus[]).map((k) => (
              <SelectItem key={k} value={k}>
                {STATUS[k].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={source ?? "all"}
          onValueChange={(v) => {
            setSource(!v || v === "all" ? null : (v as MembershipSource))
            setPage(0)
          }}
        >
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue>{source ? SOURCE[source] : "Any type"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any type</SelectItem>
            {(Object.keys(SOURCE) as MembershipSource[]).map((k) => (
              <SelectItem key={k} value={k}>
                {SOURCE[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
          <Loader />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No memberships"
          description={
            hasAnyFilter
              ? "Nothing matches these filters."
              : "No parent has a membership yet."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/80 text-[11px] tracking-wider text-secondary uppercase dark:bg-foreground">
                  {[
                    "Parent",
                    "Status",
                    "Type",
                    "Amount",
                    "Paid until",
                    "Last payment",
                    "Total paid",
                  ].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    tabIndex={0}
                    onClick={() => setSelected(r.accountId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelected(r.accountId)
                      }
                    }}
                    className="cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                  >
                    <td className="px-4 py-3">
                      <p className="text-foreground">{r.accountName ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.accountEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Pill {...STATUS[r.status]} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {SOURCE[r.source]}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {r.source === "complimentary"
                        ? "Free"
                        : `${money(r.amount)} / ${intervalWord(r.billingInterval)}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {day(r.currentPeriodEnd)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {day(r.lastPaymentAt)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {money(r.totalPaid)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              {page * MEMBERSHIP_PAGE_SIZE + 1}–{to} of {total}
            </span>
            <div className="flex gap-1">
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

      <Detail
        key={selected ?? "none"}
        accountId={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
