"use client"

import { Sidebar } from "./sidebar"
import { LayoutHeader } from "./layout-header"
import { MobileNav } from "./mobile-nav"
import { clientNav } from "@/config/nav-client"
import { coachNav } from "@/config/nav-coach"
import { adminNav } from "@/config/nav-admin"
import type { NavEntry } from "./sidebar"
import type { User } from "@supabase/supabase-js"

const navMap: Record<string, NavEntry[]> = {
  client: clientNav,
  coach: coachNav,
  admin: adminNav,
}

export function AppShell({
  portal,
  children,
  user,
}: {
  portal: "client" | "coach" | "admin"
  children: React.ReactNode
  user: User | null
}) {
  const nav = navMap[portal]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar items={nav} user={user} />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden shadow">
        <LayoutHeader user={user} />
        <main className="relative z-10 flex-1 overflow-y-auto bg-background px-4 py-6 pt-8 pb-24 md:px-6 md:pb-6">
          <div className="pointer-events-none absolute inset-0 -z-2 overflow-hidden">
            <div className="absolute -top-16 -left-16 h-40 w-40 rotate-12 rounded-3xl bg-muted/60" />
            <div className="absolute -right-10 bottom-16 h-52 w-52 rounded-full bg-muted/60" />
            <div className="absolute -bottom-20 left-1/4 h-32 w-32 -rotate-6 rounded-2xl bg-card/50" />
          </div>
          {children}
        </main>
      </div>

      {/* Mobile nav — mobile only */}
      <MobileNav items={nav} />
    </div>
  )
}
