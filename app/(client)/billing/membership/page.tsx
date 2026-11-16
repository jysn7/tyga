"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import {
  Clock,
  Sparkles,
  TriangleAlert,
  GraduationCap,
  Percent,
  Bell,
  NotebookPen,
  Dumbbell,
} from "lucide-react"
import { Loader } from "@/components/portals/shared/loader"
import {
  useMyMembership,
  type MembershipStatus,
} from "@/hooks/client/use-membership"
import { MembershipActiveState } from "@/components/portals/client/membership/membership-active-state"
import { MembershipActions } from "@/components/portals/client/membership/membership-actions"
import { MembershipPaymentHistory } from "@/components/portals/client/membership/membership-payment-history"
import { MembershipStarter } from "@/components/portals/client/membership/membership-starter"

const date = (s: string | null) =>
  s ? format(parseISO(s), "d MMMM yyyy") : "—"

const STATUS: Record<MembershipStatus, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-green-light" },
  non_renewing: { label: "Ending", cls: "bg-yellow-light" },
  attention: { label: "Payment needed", cls: "bg-red-light" },
  cancelled: { label: "Ended", cls: "bg-muted" },
  expired: { label: "Expired", cls: "bg-muted" },
  pending: { label: "Pending", cls: "bg-blue-light" },
}

const BENEFITS = [
  {
    icon: GraduationCap,
    title: "Enrolment in any programme",
    body: "Every programme across every venue, including holiday camps and clinics.",
  },
  {
    icon: Percent,
    title: "Sibling discounts",
    body: "Automatic discounts when you enrol more than one child from your family.",
  },
  {
    icon: Bell,
    title: "Session reminders",
    body: "A reminder before every session, so nothing gets missed.",
  },
  {
    icon: NotebookPen,
    title: "Session notes",
    body: "Coach notes visible in your portal after each session.",
  },
  {
    icon: Dumbbell,
    title: "Equipment and gear",
    body: "Borrow academy clubs, balls, and training gear for every programme.",
  },
]

export default function MembershipPage() {
  const returning = useSearchParams().get("checkout") === "done"
  const [polling, setPolling] = useState(returning)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const { data, isLoading, error } = useMyMembership({ pollWhile: polling })

  const shouldPoll = polling && !data?.hasAccess

  useEffect(() => {
    if (!shouldPoll) return
    const t = setTimeout(() => setPolling(false), 60_000)
    return () => clearTimeout(t)
  }, [shouldPoll])

  if (isLoading)
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader />
      </div>
    )

  if (error || !data)
    return (
      <p className="text-sm text-destructive">
        {error?.message ?? "Could not load your membership"}
      </p>
    )

  const m = data.membership
  const managedByAcademy = m?.source !== "paystack" && m?.isOpen
  const isActiveOrPending =
    (m?.status === "active" || m?.status === "pending") &&
    m.source === "paystack"

  return (
    <div className="max-w-8xl grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {/* ============ Main column ============ */}
      <div className="flex min-w-0 flex-col gap-6">
        {/* Membership card */}
        <section className="flex flex-col gap-5 rounded-2xl bg-card p-6 shadow">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Membership
              </h1>
              <p className="text-xs text-muted-foreground">
                {data.required
                  ? "Required to enrol your children in programmes."
                  : "Optional, but unlocks every programme."}
              </p>
            </div>
            {m && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium text-foreground ${STATUS[m.status].cls}`}
              >
                {STATUS[m.status].label}
              </span>
            )}
          </div>

          {shouldPoll && !data.hasAccess && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-border bg-blue-light px-4 py-3 text-sm text-foreground"
            >
              <Clock
                className="mt-0.5 h-4 w-4 shrink-0 text-information"
                strokeWidth={1.75}
              />
              <div>
                <p className="font-medium">Confirming your payment</p>
                <p className="text-xs text-muted-foreground">
                  This usually takes a few seconds. You can leave this page and
                  come back later.
                </p>
              </div>
            </div>
          )}

          {(!m || !m.isOpen) && (
            <MembershipStarter
              data={data}
              hadPrevious={!!m}
              previousEndedOn={m?.periodEnd ?? null}
            />
          )}

          {isActiveOrPending && <MembershipActiveState membership={m} />}

          {m?.status === "attention" && (
            <div className="flex flex-col gap-2 rounded-xl border border-red-light bg-red-light/40 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <TriangleAlert
                  className="h-4 w-4 text-destructive"
                  strokeWidth={1.75}
                />
                Your last payment didn&apos;t go through
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                Please update your card
                {m.graceUntil ? ` before ${date(m.graceUntil)}` : ""} to keep
                your membership.
              </p>
            </div>
          )}

          {m?.status === "non_renewing" && (
            <p className="text-sm leading-relaxed text-foreground">
              Your membership won&apos;t renew. You keep it until{" "}
              <strong className="font-semibold">{date(m.periodEnd)}</strong>.
            </p>
          )}

          {managedByAcademy && (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
              <Sparkles
                className="mt-0.5 h-4 w-4 shrink-0 text-purple"
                strokeWidth={1.75}
              />
              <p className="text-sm leading-relaxed text-foreground">
                {m?.source === "complimentary"
                  ? "The academy has given you a complimentary membership."
                  : "Your membership was paid directly to the academy."}{" "}
                It runs until{" "}
                <strong className="font-semibold">
                  {date(m?.periodEnd ?? null)}
                </strong>
                .
              </p>
            </div>
          )}

          {m && (
            <MembershipActions
              membership={m}
              confirmingCancel={confirmCancel}
              onStartConfirmCancel={() => setConfirmCancel(true)}
              onCloseConfirmCancel={() => setConfirmCancel(false)}
            />
          )}
        </section>

        {/* Benefits — plain bullet list, no card */}
        <section className="flex flex-col gap-4 px-1">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              What&apos;s included
            </h2>
            <p className="text-xs text-muted-foreground">
              Every membership includes the following.
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                  <Icon
                    className="h-3.5 w-3.5 text-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Benefits apply automatically — sibling discounts at enrolment, and
            session notes appear in your portal shortly after each session.
          </p>
        </section>
      </div>

      {/* ============ Sidebar — payment history ============ */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <MembershipPaymentHistory charges={data.charges} />
      </aside>
    </div>
  )
}
