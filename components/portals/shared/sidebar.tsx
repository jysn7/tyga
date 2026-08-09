"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores/useAppStore"
import { useTheme } from "next-themes"
import { Search, PanelLeftClose } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import Image from "next/image"

type NavItem = { label: string; href: string; icon: LucideIcon }

export function Sidebar({
  items,
  user,
}: {
  items: NavItem[]
  user: User | null
}) {
  const pathname = usePathname()
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const { resolvedTheme } = useTheme()

  const [searchQuery, setSearchQuery] = useState("")

  const logoSrc =
    resolvedTheme === "dark" ? "/logo/light.png" : "/logo/dark.png"

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={cn(
          "z-40 flex h-screen flex-col overflow-hidden bg-background transition-all duration-300 ease-in-out",
          "max-md:fixed max-md:inset-y-0 max-md:left-0",
          "md:sticky md:top-0",
          sidebarOpen
            ? "w-64 max-md:translate-x-0"
            : "w-64 max-md:-translate-x-full md:w-0 md:border-r-0"
        )}
      >
        <div className="flex h-full w-64 flex-col">
          {/* Top Header & Collapse Toggle */}
          <div className="flex h-20 shrink-0 items-center justify-between px-3.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                {resolvedTheme && (
                  <Image
                    width={36}
                    height={36}
                    alt="TYGA Logo"
                    src={logoSrc}
                    className="h-full w-full object-contain"
                    priority
                  />
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs leading-none font-semibold tracking-tight text-foreground">
                  TYGA
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {user ? user.email || "Member" : "Portal"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="px-3 pb-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-md border border-secondary bg-secondary pr-3 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none active:border-primary"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
            <p className="my-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Navigation
            </p>
            {filteredItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground shadow"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{item.label}</span>

                  {isActive && (
                    <span className="absolute left-0 h-4 w-0.5 rounded-r-full bg-primary" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
