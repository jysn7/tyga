"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { CheckCircle2 } from "lucide-react"
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          disabled={isFull}
          size="sm"
          className={`h-9 rounded-md px-4 text-xs font-medium ${fullWidthTrigger ? "w-full" : ""}`}
        >
          {isFull ? "Full" : "Enroll now"}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        <SheetHeader className="space-y-1.5 border-b border-border/60 px-6 py-4 text-left">
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {programme.levelName}
          </span>
          <div>
            <SheetTitle className="text-base leading-snug font-semibold text-foreground">
              {programme.name}
            </SheetTitle>
            <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
              {programme.venueName} · {programme.recurrenceRule}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Select a member to enroll
            </h4>
            <div className="space-y-2">
              <Select
                value={selectedMemberId}
                onValueChange={(value) => setSelectedMemberId(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {mockMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
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
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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

              <p className="text-[11px] text-muted-foreground">
                Only members who meet the age and eligibility requirements are
                shown.
              </p>
            </div>
          </div>

          {selectedMember && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Member details
              </h4>
              <div className="flex flex-col divide-y divide-border/60 text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Full name</span>
                  <span className="text-foreground">{selectedMember.name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Age</span>
                  <span className="text-foreground">
                    {selectedMember.age} years
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="text-foreground">
                    {selectedMember.gender}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Current level</span>
                  <span className="text-foreground">
                    {selectedMember.level}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="notes"
              className="text-xs font-medium text-foreground"
            >
              Medical notes{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="notes"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="Allergies, medication, or details for the coach"
              className="min-h-20 resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs">
            <span className="text-muted-foreground">Programme fee</span>
            <div className="text-right">
              <span className="font-medium text-foreground">
                R{programme.price}
              </span>
              <span className="ml-1 text-[11px] text-muted-foreground">
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

        <SheetFooter className="flex-row items-center justify-between gap-3 border-t border-border/60 px-6 py-3.5">
          <div className="text-left">
            <div className="text-base font-semibold text-foreground">
              R{programme.price}
            </div>
            <div className="text-[10px] text-muted-foreground">per term</div>
          </div>
          <div className="flex gap-2">
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              size="sm"
              variant="secondary"
              disabled={!agreed || !selectedMemberId}
              className="h-8 rounded-md px-4 text-xs font-medium"
              onClick={() => setOpen(false)}
            >
              Confirm enrollment
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
