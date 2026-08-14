"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { createClient } from "@/utils/supabase/client"
import type { AdminMember } from "@/hooks/admin/use-members"

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

export function AdminMemberTableRow({ member }: { member: AdminMember }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const isArchived = member.archivedAt !== null

  async function handleToggleArchive() {
    setSaving(true)
    const toastId = `member-archive-${member.id}`
    const fn = isArchived ? "admin_unarchive_member" : "admin_archive_member"

    toast.add({
      id: toastId,
      title: isArchived ? "Unarchiving member..." : "Archiving member...",
      type: "loading",
      timeout: 0,
    })

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc(fn, { p_member_id: member.id })
      if (error) throw error

      toast.add({
        id: toastId,
        title: isArchived ? "Member restored" : "Member archived",
        type: "success",
        timeout: 4000,
      })
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        id: toastId,
        title: "Failed to update member",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="border-b border-border/60 text-sm last:border-b-0 hover:bg-accent/40">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0 rounded-full">
            <AvatarFallback className="border-blue bg-blue text-xs font-medium text-primary-foreground">
              {getInitials(member.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {member.fullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {getAge(member.dob)} yrs
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-foreground">{member.accountFullName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {member.accountEmail}
          </p>
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {member.currentLevelName ?? "Not assessed"}
      </td>

      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {member.activeEnrollmentCount}
      </td>

      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground"
          disabled={saving}
          onClick={handleToggleArchive}
        >
          {isArchived ? "Restore" : "Archive"}
        </Button>
      </td>
    </tr>
  )
}
