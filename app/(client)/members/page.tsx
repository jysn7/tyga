import { PageHeader } from "@/components/portals/shared/page-header"
import { MemberList } from "@/components/portals/client/members/member-list"
import { sampleMembers } from "@/components/portals/client/members/members-sample-data"

export default function MembersPage() {
  const members = sampleMembers

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Members"
        description="Manage your children's profiles, placement, and progress"
      />
      <MemberList members={members} viewerRole="client" />
    </div>
  )
}
