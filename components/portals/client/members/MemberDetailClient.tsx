"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EditMemberPanel } from "@/components/portals/client/members/edit-member-modal"
import { MemberDetailTabs } from "@/components/portals/client/members/member-detail-tabs"
import { useMember } from "@/hooks/client/members/use-members"
import { useMemberProgrammes } from "@/hooks/client/members/use-member-programmes"
import { useMemberProgression } from "@/hooks/client/members/use-member-progression"

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

export function MemberDetailClient({ memberId }: { memberId: string }) {
  const { data: member, isLoading, error } = useMember(memberId)
  const { data: programmes } = useMemberProgrammes(memberId)
  const { data: progression } = useMemberProgression(memberId)

  if (isLoading)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
    )
  if (error || !member) notFound()

  const isAssessed = member.currentLevelName !== null

  return (
    <div className="flex w-full flex-col gap-8">
      <Link
        href="/members"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to members
      </Link>

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 shrink-0 rounded-full">
          <AvatarFallback className="bg-pink text-xl font-medium text-background">
            {getInitials(member.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
            {member.fullName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getAge(member.dob)} years old ·{" "}
            {isAssessed ? member.currentLevelName : "Not yet assessed"} ·{" "}
            <span className="capitalize">{member.gender}</span>
          </p>
          {!member.onboardingComplete && (
            <p className="text-xs font-medium text-amber-600">
              Registration incomplete
            </p>
          )}
        </div>

        <div className="ml-auto">
          <EditMemberPanel member={member} />
        </div>
      </div>

      <MemberDetailTabs
        member={member}
        programmes={programmes ?? []}
        progression={progression ?? null}
      />
    </div>
  )
}
