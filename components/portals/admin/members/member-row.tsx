"use client"

import { useState } from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { Archive, ArchiveRestore, ExternalLink } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
    .toUpperCase()
}

export function AdminMemberTableRow({ member }: { member: AdminMember }) {
  const queryClient = useQueryClient()
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

      await queryClient.invalidateQueries({ queryKey: ["admin-members"] })

      toast.add({
        id: toastId,
        title: isArchived ? "Member restored" : "Member archived",
        type: "success",
        timeout: 4000,
      })
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
    <tr
      className={`group border-b border-border/60 text-sm transition-colors last:border-b-0 hover:bg-accent/40 ${
        isArchived ? "opacity-50" : ""
      }`}
    >
      {/* Member */}
      <td className="px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 rounded-lg">
            <AvatarFallback className="rounded-rounded bg-green-light text-[11px] font-semibold text-green">
              {getInitials(member.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {member.fullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {getAge(member.dob)} years
            </p>
          </div>
        </div>
      </td>

      {/* Parent account */}
      <td className="px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground">
            {member.accountFullName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {member.accountEmail}
          </p>
        </div>
      </td>

      {/* Level */}
      <td className="px-4 py-2 whitespace-nowrap">
        {member.currentLevelName ? (
          <span className="inline-flex items-center rounded-full bg-yellow px-2 py-0.5 text-[11px] font-medium text-secondary">
            {member.currentLevelName}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Not assessed</span>
        )}
      </td>

      {/* Enrollments */}
      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
        <span className="text-sm">
          {member.activeEnrollmentCount}
          <span className="ml-1 text-xs text-muted-foreground">
            {member.activeEnrollmentCount === 1 ? "programme" : "programmes"}
          </span>
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          {isArchived && (
            <span className="mr-1 rounded-full bg-input px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Archived
            </span>
          )}

          <Link
            href={`/admin/members/${member.id}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-accent hover:text-foreground"
            title="View member"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>

          <button
            type="button"
            disabled={saving}
            onClick={handleToggleArchive}
            title={isArchived ? "Restore member" : "Archive member"}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            {isArchived ? (
              <ArchiveRestore className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <Archive className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </td>
    </tr>
  )
}
