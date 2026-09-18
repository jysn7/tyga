"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { createClient } from "@/utils/supabase/client"
import type { Account } from "@/hooks/admin/use-accounts"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

const ROLE_LABELS: Record<Account["role"], string> = {
  parent: "Parent",
  coach: "Coach",
  admin: "Admin",
}

export function AccountTableRow({ account }: { account: Account }) {
  const router = useRouter()
  const [roleSaving, setRoleSaving] = useState(false)
  const [activeSaving, setActiveSaving] = useState(false)

  async function handleRoleChange(newRole: Account["role"]) {
    if (newRole === account.role) return
    setRoleSaving(true)
    const toastId = `account-role-${account.id}`

    toast.add({
      id: toastId,
      title: "Updating role...",
      type: "loading",
      timeout: 0,
    })

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc("admin_set_account_role", {
        p_account_id: account.id,
        p_role: newRole,
      })
      if (error) throw error

      toast.add({
        id: toastId,
        title: "Role updated",
        description: `${account.fullName} is now ${ROLE_LABELS[newRole]}`,
        type: "success",
        timeout: 4000,
      })
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        id: toastId,
        title: "Failed to update role",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setRoleSaving(false)
    }
  }

  async function handleActiveToggle(next: boolean) {
    setActiveSaving(true)
    const toastId = `account-active-${account.id}`

    toast.add({
      id: toastId,
      title: next ? "Activating account..." : "Deactivating account...",
      type: "loading",
      timeout: 0,
    })

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc("admin_set_account_active", {
        p_account_id: account.id,
        p_active: next,
      })
      if (error) throw error

      toast.add({
        id: toastId,
        title: next ? "Account activated" : "Account deactivated",
        type: "success",
        timeout: 4000,
      })
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        id: toastId,
        title: "Failed to update account",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setActiveSaving(false)
    }
  }

  return (
    <tr className="border-b border-border/60 text-sm last:border-b-0 hover:bg-accent/40">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0 rounded-full">
            <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
              {getInitials(account.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {account.fullName}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {account.email}
      </td>

      <td className="px-4 py-3">
        <Select
          value={account.role}
          onValueChange={(v) => handleRoleChange(v as Account["role"])}
          disabled={roleSaving}
        >
          <SelectTrigger className="h-8 w-28 border-none bg-transparent px-2 text-sm shadow-none hover:bg-accent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parent">Parent</SelectItem>
            <SelectItem value="coach">Coach</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={account.active}
            onCheckedChange={handleActiveToggle}
            disabled={activeSaving}
          />
          <span className="text-xs text-muted-foreground">
            {account.active ? "Active" : "Inactive"}
          </span>
        </div>
      </td>
    </tr>
  )
}
