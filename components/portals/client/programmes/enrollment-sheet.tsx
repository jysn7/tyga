"use client"

import { useState } from "react"
import { ClipboardList, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field } from "@/components/portals/shared/field"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Programme } from "./programme-card"

const mockMembers = [
  { id: "1", name: "James Doe", age: 10, gender: "Male", level: "Foundation" },
  {
    id: "2",
    name: "Emma Doe",
    age: 12,
    gender: "Female",
    level: "Skill Building",
  },
  {
    id: "3",
    name: "Liam Johnson",
    age: 9,
    gender: "Male",
    level: "Foundation",
  },
  {
    id: "4",
    name: "Sarah Williams",
    age: 14,
    gender: "Female",
    level: "Performance",
  },
]

export function EnrollmentSheet({
  programme,
  fullWidthTrigger = false,
}: {
  programme: Programme
  fullWidthTrigger?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [medicalNotes, setMedicalNotes] = useState("")

  const isFull = programme.enrolledCount >= programme.capacity
  const selectedMember = mockMembers.find((m) => m.id === selectedMemberId)

  return (
    <>
      <Button
        disabled={isFull}
        size="sm"
        className={`h-9 rounded-md px-4 text-xs font-medium ${fullWidthTrigger ? "w-full" : ""}`}
        onClick={() => setOpen(true)}
      >
        {isFull ? "Full" : "Enroll now"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-xl [&>button]:top-6 [&>button]:right-6 [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
          <DialogHeader className="flex flex-row items-center gap-3.5 space-y-0 p-0 pb-6 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
              <ClipboardList
                className="h-4.5 w-4.5 text-foreground"
                strokeWidth={1.75}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground">
                {programme.name}
              </DialogTitle>
              <span className="truncate text-xs text-muted-foreground">
                {programme.venueName} · {programme.recurrenceRule}
              </span>
            </div>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            <Field label="Select a member to enroll">
              <Select
                value={selectedMemberId}
                onValueChange={(value) => setSelectedMemberId(value ?? "")}
              >
                <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {mockMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-secondary text-[10px] text-foreground">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-medium text-foreground">
                            {member.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {member.age} yrs · {member.gender} · {member.level}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedMember && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-input px-3 py-2.5 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <div>
                    <span className="font-medium text-foreground">
                      {selectedMember.name}
                    </span>
                    <span className="text-muted-foreground">
                      {" · "}
                      {selectedMember.age} yrs · {selectedMember.gender} ·{" "}
                      {selectedMember.level}
                    </span>
                  </div>
                </div>
              )}

              <p className="mt-1.5 text-xs text-muted-foreground">
                Only members who meet the age and eligibility requirements are
                shown.
              </p>
            </Field>

            {selectedMember && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Member details
                </span>
                <div className="flex flex-col divide-y divide-border/60">
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-muted-foreground">Full name</span>
                    <span className="text-foreground">
                      {selectedMember.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-muted-foreground">Age</span>
                    <span className="text-foreground">
                      {selectedMember.age} years
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="text-foreground">
                      {selectedMember.gender}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-muted-foreground">Current level</span>
                    <span className="text-foreground">
                      {selectedMember.level}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Field label="Medical notes (optional)">
              <Textarea
                id="notes"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="Allergies, medication, or details for the coach"
                className="min-h-20 resize-none rounded-lg border border-border bg-input p-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
              />
            </Field>

            <div className="flex items-center justify-between rounded-lg border border-border bg-input p-3.5">
              <span className="text-sm text-muted-foreground">
                Programme fee
              </span>
              <div className="text-right">
                <span className="text-sm font-medium text-foreground">
                  R{programme.price}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  per term
                </span>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-xs leading-normal text-muted-foreground">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5"
              />
              <span>
                I confirm the participant meets the age and eligibility
                requirements and accept the terms of enrollment.
              </span>
            </label>
          </div>

          <DialogFooter className="mt-8 flex flex-col gap-3 p-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left">
              <div className="text-base font-semibold text-foreground">
                R{programme.price}
              </div>
              <div className="text-[10px] text-muted-foreground">per term</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                disabled={!agreed || !selectedMemberId}
                onClick={() => setOpen(false)}
              >
                Confirm enrollment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
