"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, AlertCircle } from "lucide-react"
import { BookAssessmentPanel } from "@/components/portals/client/members/book-assessment-panel"

export type Member = {
  id: string
  fullName: string
  dob: string
  gender: "male" | "female" | "any"
  currentLevelName: string | null
  nextSessionLabel: string | null
  activeEnrollmentCount: number
  onboardingComplete: boolean
}

const sampleVenues = [
  { id: "1", name: "Soweto Country Club" },
  { id: "2", name: "Zodwa Khoza Foundation" },
  { id: "3", name: "School Facility" },
  { id: "4", name: "Driving Range" },
]

function getAge(dob: string) {
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export function MemberTile({
  member,
  viewerRole,
}: {
  member: Member
  viewerRole: "client" | "coach" | "admin"
}) {
  const [assessmentOpen, setAssessmentOpen] = useState(false)

  const isAssessed = member.currentLevelName !== null
  const clickable = viewerRole === "client"

  const tile = (
    <div
      className={`group flex flex-col gap-4 rounded-xl border border-secondary bg-secondary p-4 shadow transition-colors hover:border-primary ${
        clickable ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <Avatar className="h-11 w-11 rounded-full">
          <AvatarFallback className="bg-pink text-sm font-medium text-background">
            {getInitials(member.fullName)}
          </AvatarFallback>
        </Avatar>

        {clickable && (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{member.fullName}</p>
        <p className="text-xs text-muted-foreground">
          {getAge(member.dob)} years old ·{" "}
          {isAssessed ? member.currentLevelName : "Not yet assessed"}
        </p>
        {member.nextSessionLabel && (
          <p className="text-xs text-muted-foreground">
            Next: {member.nextSessionLabel}
          </p>
        )}
        {viewerRole === "coach" && (
          <p className="text-xs text-muted-foreground">
            {member.activeEnrollmentCount} active enrollment
            {member.activeEnrollmentCount === 1 ? "" : "s"}
          </p>
        )}
        {!member.onboardingComplete && (
          <p className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="h-3 w-3" />
            Registration incomplete
          </p>
        )}
      </div>

      {viewerRole === "client" && !isAssessed && (
        <Button
          size="sm"
          variant="secondary"
          className="w-fit rounded-md text-xs font-medium"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setAssessmentOpen(true)
          }}
        >
          Book an assessment
        </Button>
      )}
    </div>
  )

  return (
    <>
      {clickable ? <Link href={`/members/${member.id}`}>{tile}</Link> : tile}

      <BookAssessmentPanel
        memberName={member.fullName}
        venues={sampleVenues}
        open={assessmentOpen}
        onOpenChange={setAssessmentOpen}
        onSubmit={async (data) => {
          console.log("book assessment", data)
        }}
      />
    </>
  )
}
