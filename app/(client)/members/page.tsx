"use client"

import { PageHeader } from "@/components/portals/shared/page-header"
import { MemberList } from "@/components/portals/client/members/member-list"
import Link from "next/link"
import { useMembers } from "@/hooks/use-members"
import { Loader } from "@/components/portals/shared/loader"
import { Plus } from "lucide-react"
export default function MembersPage() {
  const { data: members, isLoading, error } = useMembers()

  if (isLoading)
    return (
      <div className="flex h-full w-full justify-center">
        <Loader />
      </div>
    )

  if (error) {
    console.error("useMembers error:", error)
    return (
      <div className="text-sm text-destructive">Error: {error.message}</div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Members"
        description="Manage your children's profiles, placement, and progress"
        action={
          <Link
            href="/members/new"
            className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-3 text-xs text-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Member
          </Link>
        }
      />
      <MemberList members={members ?? []} viewerRole="client" />
    </div>
  )
}
