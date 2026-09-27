"use client"

import Link from "next/link"
import { ChevronLeft, ShieldAlert } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export function MemberDetailHeader({
  member,
  account,
  level,
  age,
}: {
  member: { full_name: string; gender: string; archived_at: string | null }
  account: { email?: string | null } | null
  level: { name: string } | null
  age: number | null
}) {
  return (
    <>
      <Link
        href="/admin/members"
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />/ members /{" "}
        {member.full_name}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 shrink-0 rounded-full border-0 ring-0">
            <AvatarFallback className="rounded-full bg-input text-base font-semibold text-foreground">
              {getInitials(member.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {member.full_name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {age !== null && <span>{age} years</span>}
              <span className="text-border">|</span>
              <span className="capitalize">{member.gender}</span>
              {account?.email && (
                <>
                  <span className="text-border">|</span>
                  <span className="truncate">{account.email}</span>
                </>
              )}
              <span className="text-border">|</span>
              <span className="inline-flex items-center rounded-full bg-yellow px-2 py-0.5 text-[11px] text-primary-foreground">
                {level?.name ?? "Not yet assessed"}
              </span>
            </div>

            {member.archived_at && (
              <span className="text-xs font-medium text-destructive">
                Archived
              </span>
            )}
          </div>
        </div>

        <div className="sm:ml-auto">
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-rose px-2.5 py-1 text-[11px] font-medium text-secondary sm:flex">
            <ShieldAlert className="h-3 w-3" strokeWidth={1.75} />
            Sensitive view
          </span>
        </div>
      </div>
    </>
  )
}
