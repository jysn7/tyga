"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/portals/shared/loader"
import { useEnrollableMembers } from "@/hooks/client/use-programmes"
import { useEnroll } from "@/hooks/client/use-enroll"
import {
  useJoinWaitlist,
  useLeaveWaitlist,
  useMyWaitlist,
} from "@/hooks/client/use-waitlist"
import { toast } from "@/components/ui/toast"
import {
  AlertCircle,
  Tag,
  Check,
  X,
  Loader2,
  Users,
  Clock,
  Lock,
  ArrowRight,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import type { ProgrammeListItem } from "@/lib/types"

const money = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 0,
      }).format(n)

type DiscountLine = { label: string; amount: number }

type PricePreview = {
  base: number
  discount_total: number
  net: number
  lines: DiscountLine[]
  code_status?: string | null
  code_message?: string | null
}

type Mode = "enrol" | "waitlist"

type MembershipStatus =
  | "pending"
  | "active"
  | "non_renewing"
  | "attention"
  | "cancelled"
  | "expired"
  | null

function membershipBlockerCopy(status: MembershipStatus): {
  title: string
  body: string
  cta: string
} {
  switch (status) {
    case "attention":
      return {
        title: "Update your card to enrol",
        body: "Your last membership payment didn't go through. Update your card on the membership page to keep access and enrol.",
        cta: "Update card",
      }
    case "pending":
      return {
        title: "Membership pending",
        body: "We're waiting for your first payment to confirm. Enrolment unlocks as soon as it clears.",
        cta: "View membership",
      }
    case "expired":
      return {
        title: "Membership expired",
        body: "Your academy membership has expired. Renew it to regain enrolment access.",
        cta: "Renew membership",
      }
    case "cancelled":
      return {
        title: "Membership ended",
        body: "Your academy membership has ended. Set up a new one to enrol again.",
        cta: "Set up membership",
      }
    default:
      return {
        title: "Membership required",
        body: "Academy membership is required before you can enrol your children in programmes.",
        cta: "Set up membership",
      }
  }
}

export function EnrollModal({
  programme,
  open,
  onOpenChange,
  membershipBlocked = false,
  membershipStatus = null,
}: {
  programme: ProgrammeListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  membershipBlocked?: boolean
  membershipStatus?: MembershipStatus
}) {
  const supabase = createClient()

  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [mode, setMode] = useState<Mode>("enrol")

  const [promoInput, setPromoInput] = useState("")
  const [appliedPromo, setAppliedPromo] = useState("")
  const [promoError, setPromoError] = useState<string | null>(null)

  const [priceData, setPriceData] = useState<PricePreview | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)

  const programmeId = programme ? Number(programme.id) : 0
  const { data: members, isLoading } = useEnrollableMembers(programmeId)
  const enroll = useEnroll()
  const joinWaitlist = useJoinWaitlist()
  const leaveWaitlist = useLeaveWaitlist()
  const { data: myWaitlist = [] } = useMyWaitlist()

  const eligible = useMemo(
    () => (members ?? []).filter((m) => m.isEligible),
    [members]
  )
  const ineligible = useMemo(
    () => (members ?? []).filter((m) => !m.isEligible),
    [members]
  )
  const hasEligible = eligible.length > 0
  const hasMembers = (members ?? []).length > 0

  const selectedMember = eligible.find(
    (m) => m.id.toString() === selectedMemberId
  )

  const rpcSaysFull = (members ?? []).some((m) => m.programmeFull === true)
  const capacity = (programme as { capacity?: number | null })?.capacity ?? null
  const enrolledCount =
    (programme as { enrolledCount?: number | null })?.enrolledCount ?? null
  const objectSaysFull =
    capacity != null && enrolledCount != null && enrolledCount >= capacity

  const isFull = isLoading ? false : rpcSaysFull || objectSaysFull

  const existingWaitlistRow = useMemo(() => {
    if (!programme || !selectedMemberId) return null
    return (
      myWaitlist.find(
        (w) =>
          w.programmeId === Number(programme.id) &&
          w.memberId === Number(selectedMemberId)
      ) ?? null
    )
  }, [myWaitlist, programme, selectedMemberId])

  const effectiveMode = isFull && mode === "enrol" ? "waitlist" : mode

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setSelectedMemberId("")
      setMode("enrol")
      setPromoInput("")
      setAppliedPromo("")
      setPromoError(null)
      setPriceData(null)
    }
    onOpenChange(nextOpen)
  }

  useEffect(() => {
    async function fetchPrice() {
      if (!selectedMemberId || !programmeId || effectiveMode !== "enrol") {
        setPriceData(null)
        return
      }

      setIsLoadingPrice(true)
      try {
        const { data, error } = await supabase.rpc(
          "parent_preview_enrollment_price",
          {
            p_member_id: Number(selectedMemberId),
            p_programme_id: programmeId,
            p_promo_code: appliedPromo || null,
          }
        )
        if (error) throw error

        const preview = data as PricePreview
        setPriceData(preview)

        if (
          appliedPromo &&
          preview.code_status &&
          !["applied", "better_offer"].includes(preview.code_status)
        ) {
          setPromoError(preview.code_message ?? "Invalid code")
        } else {
          setPromoError(null)
        }
      } catch (err) {
        console.error("Failed to fetch price", err)
        if (appliedPromo) setPromoError("Failed to verify code.")
      } finally {
        setIsLoadingPrice(false)
      }
    }

    fetchPrice()
  }, [selectedMemberId, programmeId, appliedPromo, supabase, effectiveMode])

  function handleApplyPromo() {
    if (!promoInput.trim()) return
    setPromoError(null)
    setAppliedPromo(promoInput.trim())
  }

  function clearPromo() {
    setPromoInput("")
    setAppliedPromo("")
    setPromoError(null)
  }

  function handleEnroll() {
    if (!selectedMemberId || !programme) return
    enroll.mutate(
      {
        memberId: Number(selectedMemberId),
        programmeId: Number(programme.id),
        promoCode: priceData?.code_status === "applied" ? appliedPromo : null,
      },
      {
        onSuccess: ({ authorization_url }) => {
          window.location.href = authorization_url
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : ""
          if (/full/i.test(msg)) {
            setMode("waitlist")
            toast.add({
              title: "This programme just filled up",
              description: "You can join the waiting list below.",
              type: "info",
              timeout: 5000,
            })
            return
          }
          if (/membership/i.test(msg)) {
            toast.add({
              title: "Membership required",
              description: "Set up your membership to enrol in programmes.",
              type: "error",
              timeout: 6000,
            })
            return
          }
          toast.add({
            title: "Could not start enrollment",
            description: msg || "Something went wrong",
            type: "error",
            timeout: 5000,
          })
        },
      }
    )
  }

  function handleJoinWaitlist() {
    if (!selectedMemberId || !programme) return
    joinWaitlist.mutate(
      {
        memberId: Number(selectedMemberId),
        programmeId: Number(programme.id),
      },
      {
        onSuccess: ({ position }) => {
          toast.add({
            title: "You're on the waiting list",
            description: `Your position is #${position}. We'll notify you when a place opens up.`,
            type: "success",
            timeout: 6000,
          })
          onOpenChange(false)
        },
        onError: (err) =>
          toast.add({
            title: "Couldn't join the waitlist",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  function handleLeaveWaitlist() {
    if (!existingWaitlistRow) return
    leaveWaitlist.mutate(existingWaitlistRow.id, {
      onSuccess: () => {
        toast.add({
          title: "Left the waiting list",
          type: "success",
          timeout: 4000,
        })
      },
    })
  }

  if (!programme) return null

  const basePrice = programme.price ?? 0
  const finalPrice = priceData ? priceData.net : basePrice
  const discountLines = priceData?.lines ?? []
  const isPromoApplied = priceData?.code_status === "applied"
  const busy =
    enroll.isPending || joinWaitlist.isPending || leaveWaitlist.isPending

  const showWaitlistPane = effectiveMode === "waitlist" && !existingWaitlistRow

  // ---- Membership gate: blocks the entire enrolment flow ----
  if (membershipBlocked) {
    const copy = membershipBlockerCopy(membershipStatus)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-light">
                <Lock className="h-4 w-4 text-destructive" strokeWidth={2} />
              </div>
              <DialogTitle>{copy.title}</DialogTitle>
            </div>
            <DialogDescription>{copy.body}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-4">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Membership includes
            </span>
            <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check
                  className="mt-0.5 h-3 w-3 shrink-0 text-green"
                  strokeWidth={2.5}
                />
                Enrolment in every programme
              </li>
              <li className="flex items-start gap-2">
                <Check
                  className="mt-0.5 h-3 w-3 shrink-0 text-green"
                  strokeWidth={2.5}
                />
                Sibling discounts
              </li>
              <li className="flex items-start gap-2">
                <Check
                  className="mt-0.5 h-3 w-3 shrink-0 text-green"
                  strokeWidth={2.5}
                />
                Session reminders and coach notes
              </li>
              <li className="flex items-start gap-2">
                <Check
                  className="mt-0.5 h-3 w-3 shrink-0 text-green"
                  strokeWidth={2.5}
                />
                Gear and equipment access
              </li>
            </ul>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Link className="" href="/billing/membership">
              {copy.cta}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // ---- Normal enrolment / waitlist flow ----
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-6 pt-6 pb-4">
          <DialogTitle>
            {showWaitlistPane
              ? `Join waitlist for ${programme.name}`
              : `Enrol in ${programme.name}`}
          </DialogTitle>
          <DialogDescription>
            {programme.venueName || "Academy Programme"}
            {programme.recurrenceRule ? ` · ${programme.recurrenceRule}` : ""}
          </DialogDescription>
        </DialogHeader>

        {isFull && showWaitlistPane && (
          <div className="flex items-start gap-3 border-b border-border/60 bg-yellow-light/40 px-6 py-3 text-sm text-foreground">
            <Users
              className="mt-0.5 h-4 w-4 shrink-0 text-yellow"
              strokeWidth={1.75}
            />
            <div>
              <p className="font-medium">This programme is full</p>
              <p className="text-xs text-muted-foreground">
                {capacity != null && enrolledCount != null && (
                  <>
                    {enrolledCount}/{capacity} places taken.{" "}
                  </>
                )}
                Join the waiting list and we&apos;ll let you know when a place
                opens up — places go to whoever enrols first.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Left Column: Child Selection */}
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Select Child
              </span>
              {isLoading ? (
                <Loader />
              ) : !hasMembers ? (
                <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3.5">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    You don&apos;t have any members on your account yet.
                  </p>
                  <Link
                    href="/members/new"
                    className="text-xs font-medium text-information underline underline-offset-4"
                  >
                    Add a child
                  </Link>
                </div>
              ) : !hasEligible ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
                  <AlertCircle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
                    strokeWidth={1.75}
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    None of your children are eligible for this programme.
                  </p>
                </div>
              ) : (
                <Select
                  value={selectedMemberId}
                  onValueChange={(v) => setSelectedMemberId(v ?? "")}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select a child…">
                      {selectedMember?.fullName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {eligible.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {ineligible.length > 0 && (
              <details className="group rounded-xl border border-border/60 bg-muted/20">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                  <span>
                    {ineligible.length} ineligible{" "}
                    {ineligible.length === 1 ? "member" : "members"}
                  </span>
                  <span className="text-[10px] transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <ul className="flex flex-col gap-2 border-t border-border/60 px-3.5 py-3">
                  {ineligible.map((m) => (
                    <li key={m.id} className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-foreground">
                        {m.fullName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {m.reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          {/* Right Column */}
          {effectiveMode === "enrol" ? (
            <div className="flex flex-col gap-5 border-t border-border/60 bg-muted/10 p-6 sm:border-t-0 sm:border-l">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                    Promo Code
                  </span>
                  {isPromoApplied ? (
                    <div className="flex items-center justify-between rounded-lg border border-green-light bg-green-light/20 px-3 py-2 text-sm text-green">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span className="font-medium">
                          {appliedPromo.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={clearPromo}
                        className="text-green hover:opacity-70"
                        aria-label="Remove promo code"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={promoInput}
                            onChange={(e) => {
                              setPromoInput(e.target.value)
                              if (promoError) setPromoError(null)
                            }}
                            placeholder="Enter code"
                            className="h-10 pl-9 uppercase"
                            disabled={isLoadingPrice}
                          />
                        </div>
                        <Button
                          variant="secondary"
                          className="h-10"
                          onClick={handleApplyPromo}
                          disabled={!promoInput.trim() || isLoadingPrice}
                        >
                          Apply
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-xs font-medium text-destructive">
                          {promoError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base price</span>
                    <span className="font-medium">{money(basePrice)}</span>
                  </div>
                  {discountLines.map((line, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm text-green"
                    >
                      <span>{line.label}</span>
                      <span>-{money(line.amount)}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2">
                    <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                      Total due today
                    </span>
                    {isLoadingPrice ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <span className="text-2xl font-semibold tracking-tight text-foreground">
                        {money(finalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 border-t border-border/60 bg-muted/10 p-6 sm:border-t-0 sm:border-l">
              {existingWaitlistRow ? (
                <>
                  <div className="flex flex-col gap-2 rounded-lg border border-blue-light bg-blue-light/30 px-3 py-3 text-xs text-foreground">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock
                        className="h-4 w-4 shrink-0 text-information"
                        strokeWidth={1.75}
                      />
                      Already on the waiting list
                    </div>
                    <p className="text-muted-foreground">
                      Position #{existingWaitlistRow.position} ·{" "}
                      {existingWaitlistRow.status === "notified"
                        ? "A place is waiting — enrol soon!"
                        : "Waiting for a place to open."}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    You can manage your waitlist entries on the{" "}
                    <Link
                      href="/dashboard/waitlist"
                      className="font-medium text-information underline underline-offset-4"
                    >
                      waitlist page
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                    How the waiting list works
                  </span>
                  <ol className="flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground text-[9px] font-semibold text-background">
                        1
                      </span>
                      We save your child&apos;s place in the queue.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground text-[9px] font-semibold text-background">
                        2
                      </span>
                      When a place opens, we notify you — you&apos;ll have 48
                      hours to enrol and pay.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground text-[9px] font-semibold text-background">
                        3
                      </span>
                      If you don&apos;t act in time, the place goes to the next
                      family and you move back in the queue.
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="m-0 flex-col-reverse items-center gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="text-muted-foreground"
          >
            {existingWaitlistRow ? "Close" : "Cancel"}
          </Button>

          {effectiveMode === "enrol" ? (
            <Button
              variant="secondary"
              onClick={handleEnroll}
              disabled={
                !selectedMemberId ||
                enroll.isPending ||
                isLoadingPrice ||
                !!promoError
              }
              className="h-11 w-full px-6 text-sm sm:w-auto"
            >
              {enroll.isPending
                ? "Redirecting…"
                : `Enrol & pay ${money(finalPrice)}`}
            </Button>
          ) : existingWaitlistRow ? (
            <Button
              variant="ghost"
              onClick={handleLeaveWaitlist}
              disabled={busy}
              className="h-11 w-full px-6 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
            >
              {leaveWaitlist.isPending ? "Leaving…" : "Leave waiting list"}
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={handleJoinWaitlist}
              disabled={!selectedMemberId || busy || !hasEligible}
              className="h-11 w-full px-6 text-sm sm:w-auto"
            >
              {joinWaitlist.isPending ? "Joining…" : "Join waiting list"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
