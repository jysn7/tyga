"use client"

import { formatDistanceToNow, parseISO } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Account } from "@/hooks/admin/accounts/use-admin-accounts"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

const ROLE_LABELS: Record<Account["role"], string> = {
  parent: "Parent",
  coach: "Coach",
  admin: "Admin",
}

const ROLE_TINT: Record<Account["role"], string> = {
  parent: "bg-blue-light",
  coach: "bg-green-light",
  admin: "bg-purple-light",
}

function Pill({ label, cls }: { label: string; cls: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium text-foreground ${cls}`}
    >
      {label}
    </span>
  )
}

export function AccountTableRow({
  account,
  onOpen,
}: {
  account: Account
  onOpen: (id: string) => void
}) {
  const open = () => onOpen(account.id)

  return (
    <tr
      tabIndex={0}
      role="button"
      aria-label={`Open ${account.fullName}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          open()
        }
      }}
      className="cursor-pointer border-b border-border/60 text-sm transition-colors last:border-b-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
    >
      <td className="px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0 rounded-full">
            {account.avatarUrl ? (
              <AvatarImage
                src={account.avatarUrl}
                alt=""
                className="rounded-full object-cover"
              />
            ) : null}
            <AvatarFallback className="rounded-full bg-green/15 text-[11px] font-semibold text-green">
              {getInitials(account.fullName)}
            </AvatarFallback>
          </Avatar>
          <p className="min-w-0 truncate font-medium text-foreground">
            {account.fullName}
          </p>
        </div>
      </td>

      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
        {account.email}
      </td>

      <td className="px-4 py-2">
        <Pill label={ROLE_LABELS[account.role]} cls={ROLE_TINT[account.role]} />
      </td>

      <td className="px-4 py-2">
        {account.anonymised ? (
          <Pill label="Anonymised" cls="bg-muted" />
        ) : account.active ? (
          <Pill label="Active" cls="bg-green-light" />
        ) : (
          <Pill label="Deactivated" cls="bg-red-light" />
        )}
      </td>

      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
        {account.lastSignInAt
          ? formatDistanceToNow(parseISO(account.lastSignInAt), {
              addSuffix: true,
            })
          : "Never"}
      </td>

      <td className="px-4 py-2">
        <Pill
          label={account.hasMfa ? "On" : "Off"}
          cls={account.hasMfa ? "bg-green-light" : "bg-yellow-light"}
        />
      </td>

      <td className="px-4 py-2 text-muted-foreground">
        {account.role === "parent" ? account.childrenCount : "—"}
      </td>
    </tr>
  )
}
