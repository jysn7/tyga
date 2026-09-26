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
    <div className="flex w-full flex-col gap-6">
      <Link
        href="/members"
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />/ members /{" "}
        {memberId}
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 shrink-0 rounded-full border-0 ring-0">
            <AvatarFallback className="rounded-full bg-pink text-base font-semibold text-primary-foreground">
              {getInitials(member.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {member.fullName}
            </h1>

            {/* Metadata row — Notion-style inline properties */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{getAge(member.dob)} years</span>
              <span className="text-border">|</span>
              <span className="capitalize">{member.gender}</span>
              <span className="text-border">|</span>
              <span className="inline-flex items-center rounded-full bg-yellow px-2 py-0.5 text-[11px] font-light text-primary-foreground">
                {isAssessed ? member.currentLevelName : "Not yet assessed"}
              </span>
            </div>

            {!member.onboardingComplete && (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                <span className="text-xs font-medium text-orange">
                  Registration incomplete
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="sm:ml-auto">
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
