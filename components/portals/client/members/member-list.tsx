import {
  MemberTile,
  type Member,
} from "@/components/portals/client/members/member-card"
import { EmptyState } from "@/components/portals/shared/empty-state"

export function MemberList({
  members,
  viewerRole,
}: {
  members: Member[]
  viewerRole: "client" | "coach" | "admin"
}) {
  if (members.length === 0) {
    return (
      <EmptyState
        title="No members yet"
        description="Add your first child to get started with placement and enrollment."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <MemberTile key={member.id} member={member} viewerRole={viewerRole} />
      ))}
    </div>
  )
}
