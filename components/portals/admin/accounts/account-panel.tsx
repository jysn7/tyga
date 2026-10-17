"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import {
  AlertTriangle,
  Eraser,
  KeyRound,
  ShieldOff,
  UserCheck,
  UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { Field } from "@/components/portals/shared/field"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useAccountDetail,
  useAnonymiseAccount,
  useRemoveAccountMfa,
  useSendPasswordReset,
  useSetAccountActive,
  useSetAccountRole,
  type AccountRole,
} from "@/hooks/admin/accounts/use-admin-accounts"

const MEMBERS_ROUTE = "/admin/members"

type ActionKey =
  "role" | "deactivate" | "reactivate" | "reset" | "mfa" | "anonymise"

const ROLE_LABEL: Record<AccountRole, string> = {
  parent: "Parent",
  coach: "Coach",
  admin: "Admin",
}

const ROLE_TINT: Record<AccountRole, string> = {
  parent: "bg-blue-light",
  coach: "bg-green-light",
  admin: "bg-purple-light",
}

const ACTION_LABEL: Record<string, string> = {
  role_changed: "Role changed",
  deactivated: "Deactivated",
  reactivated: "Reactivated",
  password_reset_sent: "Password reset link sent",
  mfa_removed: "Authenticator removed",
  anonymised: "Anonymised",
}

const fmt = (s: string | null | undefined) =>
  s ? format(parseISO(s), "d MMM yyyy") : "—"

const initials = (n: string | null) =>
  (n ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium w-fit text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

function Pill({ label, cls }: { label: string; cls: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium text-foreground ${cls}`}
    >
      {label}
    </span>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border/60 py-2.5 last:border-b-0">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-sm text-foreground">
        {children}
      </span>
    </div>
  )
}

function ActionGroup({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-0.5">
        <h4 className="text-xs font-medium text-foreground">{title}</h4>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export function AccountPanel({
  id,
  onClose,
}: {
  id: string
  onClose: () => void
}) {
  const router = useRouter()
  const { data, isLoading, error } = useAccountDetail(id)

  const setRole = useSetAccountRole()
  const setActive = useSetAccountActive()
  const reset = useSendPasswordReset()
  const removeMfa = useRemoveAccountMfa()
  const anonymise = useAnonymiseAccount()

  const [pending, setPending] = useState<ActionKey | null>(null)
  const [reason, setReason] = useState("")
  const [newRole, setNewRole] = useState<AccountRole>("parent")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [notice, setNotice] = useState<string | null>(null)
  const [tab, setTab] = useState("details")

  const mutation = {
    role: setRole,
    deactivate: setActive,
    reactivate: setActive,
    reset,
    mfa: removeMfa,
    anonymise,
  }
  const activeMutation = pending ? mutation[pending] : null
  const busy = !!activeMutation?.isPending
  const actionError = activeMutation?.error?.message ?? null

  function resetForm() {
    setPending(null)
    setReason("")
    setConfirmEmail("")
    ;[setRole, setActive, reset, removeMfa, anonymise].forEach((m) => m.reset())
  }

  function start(a: ActionKey) {
    resetForm()
    setNotice(null)
    if (a === "role" && data) {
      setNewRole(data.role === "parent" ? "coach" : "parent")
    }
    setPending(a)
  }

  function done(message: string) {
    resetForm()
    setNotice(message)
    router.refresh()
  }

  const locked = !!data?.anonymised_at
  const reasonRequired =
    pending !== null && pending !== "reset" && pending !== "reactivate"
  const blockers = data?.anonymise_blockers ?? []
  const coachSessions = data?.coach?.upcoming_sessions ?? 0
  const hasChildren = (data?.children.length ?? 0) > 0
  const hasCoach = !!data?.coach
  const hasBilling = !!data?.membership || (data?.open_invoices.count ?? 0) > 0

  const roleBlocked =
    data &&
    ((data.role === "admin" &&
    newRole !== "admin" &&
    data.other_active_admins === 0
      ? "This is the last active administrator."
      : null) ||
      (data.role === "coach" && newRole !== "coach" && coachSessions > 0
        ? `This coach has ${coachSessions} upcoming session(s). Reassign them first.`
        : null))

  const canConfirm =
    !busy &&
    (!reasonRequired || reason.trim().length > 0) &&
    (pending !== "role" || (!!data && newRole !== data.role && !roleBlocked)) &&
    (pending !== "anonymise" ||
      (blockers.length === 0 &&
        confirmEmail.trim().toLowerCase() ===
          (data?.email ?? "").toLowerCase() &&
        confirmEmail.trim().length > 0))

  function confirm() {
    if (!data || !pending) return
    const name = data.full_name ?? data.email ?? "the account"

    switch (pending) {
      case "role":
        setRole.mutate(
          { accountId: data.id, role: newRole, reason },
          {
            onSuccess: () =>
              done(`${name} is now ${ROLE_LABEL[newRole].toLowerCase()}.`),
          }
        )
        break
      case "deactivate":
        setActive.mutate(
          { accountId: data.id, active: false, reason },
          {
            onSuccess: () =>
              done(`${name} is deactivated and signed out everywhere.`),
          }
        )
        break
      case "reactivate":
        setActive.mutate(
          { accountId: data.id, active: true, reason },
          { onSuccess: () => done(`${name} can sign in again.`) }
        )
        break
      case "reset":
        reset.mutate(data.id, {
          onSuccess: () => done(`A reset link was emailed to ${data.email}.`),
        })
        break
      case "mfa":
        removeMfa.mutate(
          { accountId: data.id, reason },
          {
            onSuccess: () =>
              done(
                `The authenticator was removed. ${name} will be asked to set up a new one at their next sign-in.`
              ),
          }
        )
        break
      case "anonymise":
        anonymise.mutate(
          { accountId: data.id, confirmEmail, reason },
          { onSuccess: (warning) => done(warning ?? `${name} was anonymised.`) }
        )
        break
    }
  }

  return (
    <SidePanel
      open
      onOpenChange={(o) => !o && onClose()}
      title={data?.full_name ?? "Account"}
      description={data?.email ?? undefined}
      header={
        data && (
          <div className="flex flex-col gap-4 border-b border-border/60 px-8 pt-8 pb-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-semibold text-foreground ${ROLE_TINT[data.role]}`}
              >
                {initials(data.full_name)}
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {data.full_name ?? "Unnamed"}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {data.email}
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <Pill
                    label={ROLE_LABEL[data.role]}
                    cls={ROLE_TINT[data.role]}
                  />
                  {locked ? (
                    <Pill label="Anonymised" cls="bg-muted" />
                  ) : data.active ? (
                    <Pill label="Active" cls="bg-green-light" />
                  ) : (
                    <Pill label="Deactivated" cls="bg-red-light" />
                  )}
                  <Pill
                    label={data.has_mfa ? "MFA on" : "MFA off"}
                    cls={data.has_mfa ? "bg-green-light" : "bg-yellow-light"}
                  />
                  {data.is_self && <Pill label="You" cls="bg-blue-light" />}
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

          {pending && (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-4">
              {pending === "role" && (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Change role
                  </p>
                  <Select
                    value={newRole}
                    onValueChange={(v) =>
                      setNewRole((v as AccountRole) ?? newRole)
                    }
                  >
                    <SelectTrigger className="h-9 w-full text-sm">
                      <SelectValue>{ROLE_LABEL[newRole]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROLE_LABEL) as AccountRole[]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newRole === "admin" && (
                    <p className="text-xs text-muted-foreground">
                      Administrators can see and change everything, including
                      children&apos;s medical notes.
                    </p>
                  )}
                  {newRole === "coach" && data.role !== "coach" && (
                    <p className="text-xs text-muted-foreground">
                      A coach record is created. Set their type and ratio on the
                      Coaches tab.
                    </p>
                  )}
                  {roleBlocked && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertTriangle
                        className="h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />{" "}
                      {roleBlocked}
                    </p>
                  )}
                </>
              )}

              {pending === "deactivate" && (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Deactivate this account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    They are signed out on every device and cannot sign in until
                    you reactivate them. Nothing is deleted.
                  </p>
                  {coachSessions > 0 && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertTriangle
                        className="h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                      This coach still has {coachSessions} upcoming session(s)
                      to reassign.
                    </p>
                  )}
                </>
              )}

              {pending === "reactivate" && (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Reactivate this account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    They will be able to sign in again.
                  </p>
                </>
              )}

              {pending === "reset" && (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Send a password reset link
                  </p>
                  <p className="text-xs text-muted-foreground">
                    An email goes to {data.email}. The link works once. You
                    never see or choose their password.
                    {data.has_mfa &&
                      " They will still need their authenticator code."}
                  </p>
                </>
              )}

              {pending === "mfa" && (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Remove authenticator
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Removes every authenticator and signs them out everywhere.
                    Only do this after confirming their identity, for example by
                    phone. Staff must set up a new one at their next sign-in.
                  </p>
                </>
              )}

              {pending === "anonymise" && (
                <>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                    <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />{" "}
                    Anonymise this account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>This cannot be undone.</strong> It removes the name,
                    email, phone, address and photo, all sign-in methods, the
                    children&apos;s names, medical and school details, emergency
                    contacts, uploaded documents, notes and notifications.
                    Children keep only their year of birth, gender and level.
                    Invoices, payments, enrolments, attendance and the admin
                    audit trail are kept, with no names.
                  </p>
                  {blockers.length > 0 ? (
                    <div className="rounded-lg border border-destructive/40 bg-red-light p-3">
                      <p className="text-xs font-medium text-foreground">
                        Not possible yet:
                      </p>
                      <ul className="mt-1 list-disc pl-5 text-xs text-foreground">
                        {blockers.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Field
                      label="Type their email to confirm"
                      hint={data.email}
                    >
                      <input
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        autoComplete="off"
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                      />
                    </Field>
                  )}
                </>
              )}

              {pending !== "reset" && (
                <Field
                  label={`Reason ${
                    reasonRequired ? "(required)" : "(optional)"
                  }`}
                >
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    maxLength={300}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                </Field>
              )}

              {actionError && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {actionError}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={!canConfirm}
                  className={`text-xs ${
                    pending === "anonymise" ||
                    pending === "deactivate" ||
                    pending === "mfa"
                      ? "bg-destructive text-white hover:bg-destructive/90"
                      : ""
                  }`}
                  onClick={confirm}
                >
                  {busy ? "Working…" : "Confirm"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={resetForm}
                  className="text-xs"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex flex-col gap-3"
          >
            <TabsList className="no-scrollbar h-auto w-fit justify-start gap-1 overflow-x-auto rounded-lg bg-input p-1">
              <TabsTrigger value="details" className={TAB_TRIGGER_CLASS}>
                Details
              </TabsTrigger>
              {hasChildren && (
                <TabsTrigger value="children" className={TAB_TRIGGER_CLASS}>
                  Children
                </TabsTrigger>
              )}
              {hasCoach && (
                <TabsTrigger value="coach" className={TAB_TRIGGER_CLASS}>
                  Coach
                </TabsTrigger>
              )}
              {hasBilling && (
                <TabsTrigger value="billing" className={TAB_TRIGGER_CLASS}>
                  Billing
                </TabsTrigger>
              )}
              <TabsTrigger value="activity" className={TAB_TRIGGER_CLASS}>
                Activity
              </TabsTrigger>
              {!locked && (
                <TabsTrigger value="actions" className={TAB_TRIGGER_CLASS}>
                  Actions
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="mt-0">
              <div className="flex flex-col">
                <Row label="Phone">{data.phone ?? "—"}</Row>
                <Row label="Joined">{fmt(data.created_at)}</Row>
                <Row label="Last sign-in">
                  {data.last_sign_in_at
                    ? formatDistanceToNow(parseISO(data.last_sign_in_at), {
                        addSuffix: true,
                      })
                    : "Never"}
                </Row>
                <Row label="Sign-in methods">
                  {data.providers.length
                    ? data.providers
                        .map((p) => (p === "email" ? "Email" : p))
                        .join(", ")
                    : "—"}
                </Row>
                {data.has_mfa && (
                  <Row label="Authenticator">
                    {data.mfa_factors
                      .map((f) => `${f.name ?? f.type} · ${fmt(f.added_at)}`)
                      .join(", ")}
                  </Row>
                )}
              </div>
            </TabsContent>

            {hasChildren && (
              <TabsContent value="children" className="mt-0">
                <div className="flex flex-col">
                  {data.children.map((c) => (
                    <Link
                      key={c.id}
                      href={`${MEMBERS_ROUTE}?member=${c.id}`}
                      className="flex items-center justify-between gap-4 border-b border-border/60 py-2.5 text-sm transition-colors last:border-b-0 hover:text-primary"
                    >
                      <span className="flex items-center gap-2 text-foreground">
                        {c.full_name}
                        {c.archived && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                            archived
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.open_enrolments} open
                      </span>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            )}

            {hasCoach && data.coach && (
              <TabsContent value="coach" className="mt-0">
                <div className="flex flex-col">
                  <Row label="Type">
                    <span className="capitalize">
                      {(data.coach.coach_type ?? "coach").replace(/_/g, " ")}
                    </span>
                  </Row>
                  <Row label="Max ratio">
                    {data.coach.max_student_ratio ?? "—"}
                  </Row>
                  <Row label="Programmes">{data.coach.programmes}</Row>
                  <Row label="Upcoming sessions">{coachSessions}</Row>
                </div>
              </TabsContent>
            )}

            {hasBilling && (
              <TabsContent value="billing" className="mt-0">
                <div className="flex flex-col">
                  {data.membership && (
                    <Row label="Membership">
                      <span className="capitalize">
                        {data.membership.status.replace(/_/g, " ")}
                      </span>{" "}
                      · R{data.membership.amount} / {data.membership.interval}
                    </Row>
                  )}
                  <Row label="Unpaid invoices">
                    {data.open_invoices.count} · R{data.open_invoices.amount}
                  </Row>
                </div>
              </TabsContent>
            )}

            <TabsContent value="activity" className="mt-0">
              {data.history.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No admin actions recorded yet.
                </p>
              ) : (
                <ol className="flex flex-col gap-3 border-l border-border pl-4">
                  {data.history.map((h, i) => (
                    <li key={i} className="relative">
                      <span className="absolute top-1.5 -left-[21px] h-2 w-2 rounded-full bg-primary" />
                      <p className="text-xs font-medium text-foreground">
                        {ACTION_LABEL[h.action] ?? h.action}
                        {h.action === "role_changed" && h.details?.from
                          ? ` (${String(h.details.from)} to ${String(h.details.to)})`
                          : ""}
                      </p>
                      {h.reason && (
                        <p className="text-xs text-muted-foreground">
                          &ldquo;{h.reason}&rdquo;
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {h.by ?? "System"} ·{" "}
                        {format(parseISO(h.at), "d MMM yyyy, HH:mm")}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </TabsContent>

            {!locked && (
              <TabsContent value="actions" className="mt-0">
                <div className="flex flex-col gap-3">
                  {data.is_self && (
                    <p className="text-xs text-muted-foreground">
                      This is your own account. Role, status and anonymise are
                      unavailable here.
                    </p>
                  )}

                  <ActionGroup
                    title="Access & permissions"
                    description="Change what this account can see and do."
                  >
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={data.is_self}
                      onClick={() => start("role")}
                      className="text-xs"
                    >
                      Change role
                    </Button>
                  </ActionGroup>

                  <ActionGroup
                    title="Account status"
                    description={
                      data.active
                        ? "Deactivation signs them out and blocks sign-in. Nothing is deleted."
                        : "This account is currently deactivated. Reactivating lets them sign in again."
                    }
                  >
                    {data.active ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={data.is_self}
                        onClick={() => start("deactivate")}
                        className="text-xs"
                      >
                        <UserX
                          className="mr-1 h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                        Deactivate account
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={data.is_self}
                        onClick={() => start("reactivate")}
                        className="text-xs"
                      >
                        <UserCheck
                          className="mr-1 h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                        Reactivate account
                      </Button>
                    )}
                  </ActionGroup>

                  <ActionGroup
                    title="Sign-in & security"
                    description="Password recovery and authenticator management."
                  >
                    {data.active && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => start("reset")}
                        className="text-xs"
                      >
                        <KeyRound
                          className="mr-1 h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                        Send password reset
                      </Button>
                    )}
                    {data.has_mfa && !data.is_self && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => start("mfa")}
                        className="text-xs"
                      >
                        <ShieldOff
                          className="mr-1 h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                        Remove authenticator
                      </Button>
                    )}
                    {!data.active && !data.has_mfa && (
                      <p className="text-xs text-muted-foreground">
                        No security actions available for this account.
                      </p>
                    )}
                  </ActionGroup>

                  {data.role !== "admin" && !data.is_self && (
                    <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 p-4">
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-xs font-medium text-destructive">
                          Danger zone
                        </h4>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Permanently removes personal data. Cannot be undone.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => start("anonymise")}
                        >
                          <Eraser
                            className="mr-1 h-3.5 w-3.5"
                            strokeWidth={1.75}
                          />
                          Anonymise account
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </SidePanel>
  )
}
