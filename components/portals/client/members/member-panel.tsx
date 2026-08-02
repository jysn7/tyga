"use client"

import { useState } from "react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays, Clock, Users } from "lucide-react"
import type { Member } from "@/components/portals/client/members/member-card"

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border/60 py-3 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}

const fieldStyles =
  "border-none bg-transparent px-0 shadow-none text-[15px] text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50"

function StatTile({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-lg bg-muted/60 p-3 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export function MemberPanel({
  member,
  open,
  onOpenChange,
  onSave,
}: {
  member: Member | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (
    updated: Partial<Member> & {
      medicalNotes?: string
      emergencyContact?: string
    }
  ) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(member?.fullName ?? "")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [medicalNotes, setMedicalNotes] = useState("")

  if (!member) return null

  function handleSave() {
    onSave?.({ fullName, emergencyContact, medicalNotes })
    setIsEditing(false)
  }

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit member" : member.fullName}
      header={
        <div className="flex items-center gap-4 px-8 pt-8 pb-4">
          <Avatar className="h-16 w-16 shrink-0 rounded-full">
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {getInitials(member.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="truncate text-xl font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit member" : member.fullName}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {member.currentLevelName ?? "Not yet assessed"}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground capitalize">
                {member.gender}
              </span>
            </div>
          </div>
        </div>
      }
      footer={
        isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1 text-sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1 text-sm" onClick={handleSave}>
              Save changes
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Edit details
          </button>
        )
      }
    >
      {isEditing ? (
        <div className="flex flex-col">
          <Field label="Full name">
            <Input
              className={fieldStyles}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
          <Field label="Emergency contact">
            <Input
              className={fieldStyles}
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Name and phone number"
            />
          </Field>
          <Field
            label="Medical notes"
            hint="Only visible to coaches directly teaching this member, and logged when viewed."
          >
            <Textarea
              className={`${fieldStyles} min-h-20 resize-none`}
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="Allergies, conditions, medication..."
              rows={4}
            />
          </Field>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-2">
            <StatTile
              icon={CalendarDays}
              label="Date of birth"
              value={new Date(member.dob).toLocaleDateString("en-ZA")}
            />
            <StatTile
              icon={Users}
              label="Enrollments"
              value={String(member.activeEnrollmentCount)}
            />
            <StatTile
              icon={Clock}
              label="Next session"
              value={member.nextSessionLabel ?? "—"}
              className="col-span-2"
            />
          </div>

          {!member.currentLevelName && (
            <Button
              size="sm"
              variant="secondary"
              className="w-full text-xs font-medium"
            >
              Book an assessment
            </Button>
          )}
        </div>
      )}
    </SidePanel>
  )
}
