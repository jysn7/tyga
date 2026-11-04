"use client"

import { useState, useEffect } from "react"
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
import { toast } from "@/components/ui/toast"
import { AlertCircle, Tag, Check, X, Loader2 } from "lucide-react"
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

// Type matching the JSON returned by parent_preview_enrollment_price
type DiscountLine = {
  label: string
  amount: number
}

type PricePreview = {
  base: number
  discount_total: number
  net: number
  lines: DiscountLine[]
  code_status?: string | null
  code_message?: string | null
}

export function EnrollModal({
  programme,
  open,
  onOpenChange,
}: {
  programme: ProgrammeListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const supabase = createClient()

  const [selectedMemberId, setSelectedMemberId] = useState<string>("")

  // Promo code state
  const [promoInput, setPromoInput] = useState("")
  const [appliedPromo, setAppliedPromo] = useState("")
  const [promoError, setPromoError] = useState<string | null>(null)

  // Real pricing state from the DB
  const [priceData, setPriceData] = useState<PricePreview | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)

  const programmeId = programme ? Number(programme.id) : 0
  const { data: members, isLoading } = useEnrollableMembers(programmeId)
  const enroll = useEnroll()

  const eligible = (members ?? []).filter((m) => m.isEligible)
  const ineligible = (members ?? []).filter((m) => !m.isEligible)
  const hasEligible = eligible.length > 0

  const selectedMember = eligible.find(
    (m) => m.id.toString() === selectedMemberId
  )

  // Fetch price preview from the DB
  useEffect(() => {
    async function fetchPrice() {
      if (!selectedMemberId || !programmeId) {
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
  }, [selectedMemberId, programmeId, appliedPromo, supabase])

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
        onError: (err) =>
          toast.add({
            title: "Could not start enrollment",
            description:
              err instanceof Error ? err.message : "Something went wrong",
            type: "error",
            timeout: 5000,
          }),
      }
    )
  }

  if (!programme) return null

  const basePrice = programme.price ?? 0
  const finalPrice = priceData ? priceData.net : basePrice
  const discountLines = priceData?.lines ?? []
  const isPromoApplied = priceData?.code_status === "applied"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-6 pt-6 pb-4">
          <DialogTitle>Enrol in {programme.name}</DialogTitle>
          <DialogDescription>
            {programme.venueName
              ? `${programme.venueName}`
              : "Academy Programme"}
            {programme.recurrenceRule ? ` · ${programme.recurrenceRule}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Left Column: Child Selection */}
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Select Child
              </span>
              {isLoading ? (
                <Loader />
              ) : !members || members.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  You don&apos;t have any members on your account yet.
                </p>
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

          {/* Right Column: Order Summary */}
          <div className="flex flex-col gap-5 border-t border-border/60 bg-muted/10 p-6 sm:border-t-0 sm:border-l">
            <div className="flex flex-col gap-4">
              {/* Promo Code */}
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

              {/* Totals */}
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
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 flex-col-reverse items-center gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={enroll.isPending}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
