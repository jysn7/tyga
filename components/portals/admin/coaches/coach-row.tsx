"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { createClient } from "@/utils/supabase/client"
import type { Coach } from "@/hooks/admin/use-coaches"

const COACH_TYPE_LABELS: Record<NonNullable<Coach["coachType"]>, string> = {
  head_coach: "Head coach",
  assistant_coach: "Assistant coach",
  volunteer: "Volunteer",
}

const COACH_TYPE_STYLES: Record<NonNullable<Coach["coachType"]>, string> = {
  head_coach: "bg-yellow",
  assistant_coach: "bg-purple",
  volunteer: "bg-teal",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function CoachTableRow({
  coach,
  onEdit,
}: {
  coach: Coach
  onEdit: (coach: Coach) => void
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleActiveToggle(next: boolean) {
    if (!coach.accountId) return
    setSaving(true)
    const toastId = `coach-active-${coach.id}`

    toast.add({
      id: toastId,
      title: next ? "Activating coach..." : "Deactivating coach...",
      type: "loading",
      timeout: 0,
    })

    try {
      const supabase = createClient()
      const { error } = next
        ? await supabase.rpc("admin_set_account_active", {
            p_account_id: coach.accountId,
            p_active: true,
          })
        : await supabase.rpc("admin_deactivate_coach", { p_coach_id: coach.id })

      if (error) throw error

      toast.add({
        id: toastId,
        title: next ? "Coach activated" : "Coach deactivated",
        type: "success",
        timeout: 4000,
      })
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        id: toastId,
        title: "Failed to update coach",
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
        !coach.active ? "opacity-60" : ""
      }`}
    >
      {/* Coach */}
      <td className="px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0 rounded-full">
            {coach.avatarUrl ? (
              <AvatarImage
                src={coach.avatarUrl}
                alt={coach.fullName}
                className="rounded-full object-cover"
              />
            ) : null}
            <AvatarFallback className="rounded-full bg-green/15 text-[11px] font-semibold text-green">
              {getInitials(coach.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {coach.fullName}
            </p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
        {coach.email}
      </td>

      {/* Coach type */}
      <td className="px-4 py-2 whitespace-nowrap">
        {coach.coachType ? (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium text-secondary ${
              COACH_TYPE_STYLES[coach.coachType]
            }`}
          >
            {COACH_TYPE_LABELS[coach.coachType]}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Max ratio */}
      <td className="px-4 py-2 whitespace-nowrap">
        {coach.maxStudentRatio != null ? (
          <span className="text-sm text-foreground">
            1<span className="text-muted-foreground">:</span>
            {coach.maxStudentRatio}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Active + Edit */}
      <td className="px-4 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={coach.active}
              onCheckedChange={handleActiveToggle}
              disabled={saving || !coach.accountId}
            />
            <span className="text-xs text-muted-foreground">
              {coach.active ? "Active" : "Inactive"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEdit(coach)}
            title="Edit coach"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  )
}
