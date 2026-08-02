"use client"

import { useState } from "react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Programme } from "@/components/portals/client/programmes/programme-card"

type EligibleMember = { id: string; fullName: string }

export function EnrollPanel({
  programme,
  eligibleMembers,
  open,
  onOpenChange,
  onConfirm,
}: {
  programme: Programme | null
  eligibleMembers: EligibleMember[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (memberId: string) => void
}) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!programme) return null

  async function handleConfirm() {
    if (!selectedMemberId) return
    setIsSubmitting(true)
    await onConfirm?.(selectedMemberId)
    setIsSubmitting(false)
  }

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Enroll in programme"
      description={programme.name}
      footer={
        <Button
          className="w-full"
          disabled={!selectedMemberId || isSubmitting}
          onClick={handleConfirm}
        >
          {isSubmitting
            ? "Redirecting to payment…"
            : `Enroll & pay R${programme.price}`}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member">Which child?</Label>
          {eligibleMembers.length > 0 ? (
            <Select
              value={selectedMemberId}
              onValueChange={(value) => setSelectedMemberId(value ?? "")}
            >
              <SelectTrigger id="member">
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              None of your children are currently eligible for this programme.
            </p>
          )}
        </div>

        <Separator />

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Venue</dt>
            <dd>{programme.venueName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Schedule</dt>
            <dd className="text-right">{programme.recurrenceRule}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Includes gear</dt>
            <dd>Yes</dd>
          </div>
        </dl>

        <Separator />

        <div className="flex justify-between font-medium">
          <span>Total due</span>
          <span>R{programme.price}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          You will be redirected to Paystack to complete payment. Your
          enrollment activates once payment is confirmed.
        </p>
      </div>
    </SidePanel>
  )
}
