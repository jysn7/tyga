"use client"

import { Sidebar } from "./sidebar"
import { LayoutHeader } from "./layout-header"
import { clientNav } from "@/config/nav-client"
import { coachNav } from "@/config/nav-coach"
import { adminNav } from "@/config/nav-admin"

const navMap = {
  client: clientNav,
  coach: coachNav,
  admin: adminNav,
}

export function AppShell({
  portal,
  children,
}: {
  portal: "client" | "coach" | "admin"
  children: React.ReactNode
}) {
  const nav = navMap[portal]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={nav} />
      <div className="flex flex-1 flex-col overflow-hidden p-2 shadow">
        <LayoutHeader />
        <main className="flex-1 overflow-y-auto bg-secondary p-6 pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}
