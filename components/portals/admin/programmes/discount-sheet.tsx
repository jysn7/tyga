"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { Percent, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  useAccounts,
  useAccountDetail,
} from "@/hooks/admin/accounts/use-admin-accounts"
import { toast } from "@/components/ui/toast"
import {
  useDeleteDiscount,
  useDiscountGrants,
  useDiscountUsage,
  useGrantDiscount,
  useProgrammeOptions,
  useRevokeGrant,
  useSaveDiscount,
  type ConditionType,
  type Discount,
  type DiscountInput,
  type DiscountStatus,
  type TriggerType,
} from "@/hooks/admin/programmes/use-discounts"

const money = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n
  )
const fmt = (s: string | null) => (s ? format(parseISO(s), "d MMM yyyy") : "—")
const fieldClass =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"

const STATUS: Record<DiscountStatus, { label: string; cls: string }> = {
  live: { label: "Live", cls: "bg-green-light" },
  paused: { label: "Paused", cls: "bg-muted" },
  scheduled: { label: "Scheduled", cls: "bg-blue-light" },
  expired: { label: "Expired", cls: "bg-muted" },
  used_up: { label: "Used up", cls: "bg-orange-light" },
}
const TRIGGERS: Record<TriggerType, string> = {
  auto: "Automatic (when a condition is met)",
  code: "Promo code",
  granted: "Granted by an admin (bursary)",
}
const CONDITIONS: Record<ConditionType, string> = {
  always: "Everyone (a campaign)",
  sibling: "Sibling: another of their children is already enrolled",
  multi_programme: "Same child is in another programme",
  early_bird: "Enrolling early (days before the term starts)",
  membership: "Parent has an active membership",
}
const TYPES = [
  "development",
  "weekly_community",
  "holiday_camp",
  "clinic",
  "corporate",
  "league",
]

const EMPTY: DiscountInput = {
  name: "",
  publicLabel: "",
  publicDescription: null,
  triggerType: "auto",
  conditionType: "sibling",
  conditionValue: 1,
  code: null,
  amountType: "percent",
  amountValue: 10,
  programmeIds: null,
  programmeTypes: null,
  startsOn: null,
  endsOn: null,
  maxRedemptions: null,
  maxPerAccount: null,
  stackable: false,
  priority: 100,
  active: true,
  notes: null,
}

function Pill({ label, cls }: { label: string; cls: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium text-foreground ${cls}`}
    >
      {label}
    </span>
  )
}

const valueText = (d: Pick<Discount, "amountType" | "amountValue">) =>
  d.amountType === "percent" ? `${d.amountValue}%` : money(d.amountValue)

// ---------- who gets a granted discount ----------
function Grants({ discount }: { discount: Discount }) {
  const { data: grants, isLoading } = useDiscountGrants(discount.id)
  const grant = useGrantDiscount()
  const revoke = useRevokeGrant()
  const { data: programmes = [] } = useProgrammeOptions()
  const [search, setSearch] = useState("")
  const { data: accounts = [] } = useAccounts({
    role: "parent",
    active: true,
    search,
  })
  const [accountId, setAccountId] = useState<string | null>(null)
  const { data: detail } = useAccountDetail(accountId)
  const [memberId, setMemberId] = useState("all")
  const [programmeId, setProgrammeId] = useState("any")
  const [expires, setExpires] = useState("")
  const [reason, setReason] = useState("")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-sm font-medium text-foreground">
          Grant this discount
        </p>

        <Field label="Search parent">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setAccountId(null)
            }}
            placeholder="Search by name or email"
            className={`w-full ${fieldClass}`}
          />
        </Field>

        {search.trim().length >= 2 && !accountId && (
          <div className="flex max-h-36 flex-col overflow-y-auto rounded-md border border-border bg-card">
            {accounts.slice(0, 8).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setAccountId(a.id)
                  setSearch(a.fullName)
                  setMemberId("all") // Reset member when parent changes
                }}
                className="px-3 py-1.5 text-left text-sm hover:bg-accent/40"
              >
                {a.fullName}{" "}
                <span className="text-xs text-muted-foreground">{a.email}</span>
              </button>
            ))}
            {accounts.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No parents found.
              </p>
            )}
          </div>
        )}

        {accountId && detail && (
          <>
            <Field label="Apply to">
              <Select
                value={memberId}
                onValueChange={(v) => setMemberId(v ?? "all")}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue>
                    {memberId === "all"
                      ? "All of this parent's children"
                      : detail.children?.find((c) => String(c.id) === memberId)
                          ?.full_name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All of this parent&apos;s children
                  </SelectItem>
                  {detail.children?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Restrict to programme">
              <Select
                value={programmeId}
                onValueChange={(v) => setProgrammeId(v ?? "any")}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue>
                    {programmeId === "any"
                      ? "Any programme this discount covers"
                      : programmes.find((p) => String(p.id) === programmeId)
                          ?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any programme</SelectItem>
                  {programmes.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Expiry date">
              <input
                type="date"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className={`w-full ${fieldClass}`}
              />
            </Field>

            <Field label="Reason (required, private)">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                maxLength={300}
                className={`w-full resize-none ${fieldClass}`}
              />
            </Field>

            {grant.error && (
              <p role="alert" className="text-xs text-destructive">
                {grant.error.message}
              </p>
            )}

            <Button
              size="sm"
              className="self-start"
              disabled={grant.isPending || reason.trim().length < 5}
              onClick={() =>
                grant.mutate(
                  {
                    discountId: discount.id,
                    accountId: memberId === "all" ? accountId : null,
                    memberId: memberId === "all" ? null : Number(memberId),
                    programmeId:
                      programmeId === "any" ? null : Number(programmeId),
                    expiresOn: expires || null,
                    reason,
                  },
                  {
                    onSuccess: () => {
                      toast.add({ title: "Discount granted", type: "success" })
                      setReason("")
                      setExpires("")
                      setSearch("")
                      setAccountId(null)
                    },
                  }
                )
              }
            >
              {grant.isPending ? "Saving..." : "Grant discount"}
            </Button>
          </>
        )}
      </div>

      {isLoading ? (
        <Loader />
      ) : !grants?.length ? (
        <p className="text-xs text-muted-foreground">
          Nobody has been granted this discount yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {grants.map((g) => (
            <li
              key={g.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3 text-sm"
            >
              <div>
                <p className="text-foreground">
                  {g.memberName ?? g.accountName}
                  {g.memberName && (
                    <span className="text-muted-foreground"> (child)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {g.programmeName ?? "Any programme"} · expires{" "}
                  {fmt(g.expiresOn)} · by {g.grantedByName ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  &quot;{g.reason}&quot;
                </p>
              </div>
              {g.isActive ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(g.id)}
                >
                  Revoke
                </Button>
              ) : (
                <Pill
                  label={g.revokedAt ? "Revoked" : "Expired"}
                  cls="bg-muted"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------- the side panel ----------
export function DiscountPanel({
  discount,
  id,
  onClose,
}: {
  discount: Discount | null
  id: number | null
  onClose: () => void
}) {
  const [f, setF] = useState<DiscountInput>(EMPTY)
  const save = useSaveDiscount()
  const del = useDeleteDiscount()
  const { data: usage } = useDiscountUsage(discount?.id ?? null)
  const { data: programmes = [] } = useProgrammeOptions()

  useEffect(() => {
    if (id === null) return
    save.reset()
    del.reset()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setF(discount ? { ...discount } : EMPTY)
  }, [id, discount]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof DiscountInput>(k: K, v: DiscountInput[K]) =>
    setF((p) => ({ ...p, [k]: v }))
  const num = (s: string) => (s === "" ? null : Number(s))
  const toggle = <T,>(list: T[] | null, v: T) => {
    const cur = list ?? []
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
    return next.length ? next : null
  }

  function handleSave() {
    save.mutate(
      { id: discount?.id ?? null, data: f },
      {
        onSuccess: () => {
          toast.add({ title: "Discount saved", type: "success" })
          onClose()
        },
      }
    )
  }

  function handleDelete() {
    if (!discount) return
    del.mutate(discount.id, {
      onSuccess: () => {
        toast.add({ title: "Discount deleted", type: "success" })
        onClose()
      },
    })
  }

  const showTabs = !!discount

  return (
    <SidePanel
      open={id !== null}
      onOpenChange={(open) => !open && onClose()}
      title={discount ? "Edit discount" : "New discount"}
      description={
        discount
          ? `${valueText(discount)} · ${STATUS[discount.status].label}`
          : "Set the rule, amount and when it applies"
      }
      header={
        discount && (
          <div className="flex items-center gap-4 border-b border-border/60 bg-muted/10 px-8 pt-8 pb-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent">
              <Percent className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-semibold tracking-tight text-foreground">
                {discount.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {valueText(discount)}
              </span>
            </div>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-5 px-6 pt-4 pb-6">
        <Tabs defaultValue="details" className="flex flex-col gap-4">
          {showTabs && (
            <TabsList className="w-fit">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="usage">
                Usage ({discount.redemptions})
              </TabsTrigger>
              {discount?.triggerType === "granted" && (
                <TabsTrigger value="grants">
                  Granted to ({discount.grants})
                </TabsTrigger>
              )}
            </TabsList>
          )}

          <TabsContent value="details" className="mt-0 flex flex-col gap-5">
            {/* Core Form */}
            <div className="flex flex-col gap-4">
              <Field label="Internal name">
                <input
                  value={f.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={`w-full ${fieldClass}`}
                />
              </Field>

              <Field label="Label on the invoice (parents see this)">
                <input
                  value={f.publicLabel}
                  onChange={(e) => set("publicLabel", e.target.value)}
                  maxLength={60}
                  className={`w-full ${fieldClass}`}
                />
                {f.triggerType === "granted" && (
                  <span className="text-xs text-muted-foreground">
                    Keep it neutral, e.g. &quot;Academy support&quot;, so a
                    family&apos;s circumstances are not exposed.
                  </span>
                )}
              </Field>

              <Field label="How is it triggered?">
                <Select
                  value={f.triggerType}
                  onValueChange={(v) => {
                    const t = (v ?? "auto") as TriggerType
                    setF((p) => ({
                      ...p,
                      triggerType: t,
                      conditionType:
                        t === "auto" ? (p.conditionType ?? "sibling") : null,
                      conditionValue:
                        t === "auto" ? (p.conditionValue ?? 1) : null,
                      code: t === "code" ? p.code : null,
                      publicDescription:
                        t === "auto" ? p.publicDescription : null,
                    }))
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue>{TRIGGERS[f.triggerType]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TRIGGERS) as TriggerType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TRIGGERS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {f.triggerType === "auto" && (
                <>
                  <Field label="Condition">
                    <Select
                      value={f.conditionType ?? "sibling"}
                      onValueChange={(v) =>
                        set("conditionType", (v ?? "sibling") as ConditionType)
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue>
                          {CONDITIONS[f.conditionType ?? "sibling"]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(CONDITIONS) as ConditionType[]).map(
                          (c) => (
                            <SelectItem key={c} value={c}>
                              {CONDITIONS[c]}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </Field>

                  {(f.conditionType === "sibling" ||
                    f.conditionType === "multi_programme" ||
                    f.conditionType === "early_bird") && (
                    <Field
                      label={
                        f.conditionType === "early_bird"
                          ? "Days before the term starts"
                          : "At least this many other enrolments"
                      }
                    >
                      <input
                        type="number"
                        min={1}
                        value={f.conditionValue ?? ""}
                        onChange={(e) =>
                          set("conditionValue", num(e.target.value))
                        }
                        className={`w-full ${fieldClass}`}
                      />
                    </Field>
                  )}

                  <Field label="Shown on the website (optional, leave empty to keep it private)">
                    <textarea
                      rows={2}
                      value={f.publicDescription ?? ""}
                      onChange={(e) =>
                        set("publicDescription", e.target.value || null)
                      }
                      maxLength={200}
                      className={`w-full resize-none ${fieldClass}`}
                    />
                  </Field>
                </>
              )}

              {f.triggerType === "code" && (
                <Field label="Promo code">
                  <input
                    value={f.code ?? ""}
                    onChange={(e) =>
                      set("code", e.target.value.toUpperCase() || null)
                    }
                    maxLength={30}
                    className={`w-full uppercase ${fieldClass}`}
                  />
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Type">
                  <Select
                    value={f.amountType}
                    onValueChange={(v) =>
                      set("amountType", (v ?? "percent") as "percent" | "fixed")
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue>
                        {f.amountType === "percent"
                          ? "Percent off"
                          : "Rand off"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percent off</SelectItem>
                      <SelectItem value="fixed">Rand off</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label={
                    f.amountType === "percent"
                      ? "Percent (1 to 100)"
                      : "Amount in rand"
                  }
                >
                  <input
                    type="number"
                    min={0.01}
                    step="0.01"
                    value={f.amountValue}
                    onChange={(e) => set("amountValue", Number(e.target.value))}
                    className={`w-full ${fieldClass}`}
                  />
                </Field>

                <Field label="Starts">
                  <input
                    type="date"
                    value={f.startsOn ?? ""}
                    onChange={(e) => set("startsOn", e.target.value || null)}
                    className={`w-full ${fieldClass}`}
                  />
                </Field>

                <Field label="Ends">
                  <input
                    type="date"
                    value={f.endsOn ?? ""}
                    onChange={(e) => set("endsOn", e.target.value || null)}
                    className={`w-full ${fieldClass}`}
                  />
                </Field>

                <Field label="Total uses (empty = unlimited)">
                  <input
                    type="number"
                    min={1}
                    value={f.maxRedemptions ?? ""}
                    onChange={(e) => set("maxRedemptions", num(e.target.value))}
                    className={`w-full ${fieldClass}`}
                  />
                </Field>

                <Field label="Uses per parent (empty = unlimited)">
                  <input
                    type="number"
                    min={1}
                    value={f.maxPerAccount ?? ""}
                    onChange={(e) => set("maxPerAccount", num(e.target.value))}
                    className={`w-full ${fieldClass}`}
                  />
                </Field>
              </div>
            </div>

            {/* Programmes Grouped Layout */}
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <fieldset className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
                <legend className="px-1 text-xs font-medium text-muted-foreground">
                  Programme types
                </legend>
                <div className="flex flex-col gap-1.5">
                  {TYPES.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 text-xs text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={f.programmeTypes?.includes(t) ?? false}
                        onChange={() =>
                          set("programmeTypes", toggle(f.programmeTypes, t))
                        }
                      />
                      {t.replace(/_/g, " ")}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
                <legend className="px-1 text-xs font-medium text-muted-foreground">
                  Specific programmes
                </legend>
                <div className="flex max-h-32 flex-col gap-1.5 overflow-y-auto">
                  {programmes.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-xs text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={f.programmeIds?.includes(p.id) ?? false}
                        onChange={() =>
                          set("programmeIds", toggle(f.programmeIds, p.id))
                        }
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={f.stackable}
                  onChange={(e) => set("stackable", e.target.checked)}
                />{" "}
                Can combine
              </label>
              <Field label="Priority (lower runs first)">
                <input
                  type="number"
                  value={f.priority}
                  onChange={(e) => set("priority", Number(e.target.value))}
                  className={`w-full ${fieldClass}`}
                />
              </Field>
            </div>

            <p className="text-[11px] text-muted-foreground">
              A parent always gets the single best discount that cannot combine,
              plus every one that can. Each is applied to the price that is
              left.
            </p>

            <Field label="Notes (private)">
              <textarea
                rows={2}
                value={f.notes ?? ""}
                onChange={(e) => set("notes", e.target.value || null)}
                className={`w-full resize-none ${fieldClass}`}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={f.active}
                onChange={(e) => set("active", e.target.checked)}
              />{" "}
              Active
            </label>

            {(save.error || del.error) && (
              <p role="alert" className="text-xs text-destructive">
                {(save.error ?? del.error)?.message}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button
                size="sm"
                disabled={
                  save.isPending || !f.name.trim() || !f.publicLabel.trim()
                }
                onClick={handleSave}
              >
                {save.isPending ? "Saving..." : "Save discount"}
              </Button>

              {discount && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                  disabled={del.isPending}
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </div>
          </TabsContent>

          {discount && (
            <TabsContent value="usage" className="mt-0 flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                {discount.redemptions} uses · {money(discount.totalDiscounted)}{" "}
                given away
              </p>
              {!usage?.length ? (
                <p className="text-xs text-muted-foreground">Not used yet.</p>
              ) : (
                usage.map((u, i) => (
                  <div
                    key={i}
                    className="flex justify-between rounded-lg border border-border/60 p-3 text-sm"
                  >
                    <div>
                      <p className="text-foreground">
                        {u.memberName}{" "}
                        <span className="text-muted-foreground">
                          ({u.accountName})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.programmeName} · {u.enrollmentStatus} ·{" "}
                        {fmt(u.redeemedAt)}
                      </p>
                    </div>
                    <span className="text-foreground">{money(u.amount)}</span>
                  </div>
                ))
              )}
            </TabsContent>
          )}

          {discount?.triggerType === "granted" && (
            <TabsContent value="grants" className="mt-0">
              <Grants discount={discount} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </SidePanel>
  )
}
