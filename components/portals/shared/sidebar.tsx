"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores/useAppStore"
import { useTheme } from "next-themes"
import { PanelLeftClose, PanelLeftOpen, ChevronDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import Image from "next/image"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type NavGroup = {
  type: "group"
  label: string
  icon: LucideIcon
  items: NavItem[]
}

export type NavLink = {
  type: "link"
  label: string
  href: string
  icon: LucideIcon
}

export type NavEntry = NavGroup | NavLink

export function Sidebar({
  items,
  user,
}: {
  items: NavEntry[]
  user: User | null
}) {
  const pathname = usePathname()
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const { resolvedTheme } = useTheme()

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => {
      const expanded: Record<string, boolean> = {}
      items.forEach((entry) => {
        if (entry.type === "group") {
          const hasActive = entry.items.some((item) =>
            pathname.startsWith(item.href)
          )
          if (hasActive) expanded[entry.label] = true
        }
      })
      return expanded
    }
  )

  const logoSrc =
    resolvedTheme === "dark" ? "/logo/light.png" : "/logo/dark.png"

  const toggleGroup = (label: string) => {
    // Clicking a group while collapsed should open the sidebar first,
    // then expand the group, so the user can see what opened.
    if (!sidebarOpen) {
      toggleSidebar()
      setExpandedGroups((prev) => ({ ...prev, [label]: true }))
      return
    }
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

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
            : "w-64 max-md:-translate-x-full md:w-16 md:border-r md:border-border/60"
        )}
      >
        {/* Inner wrapper — tracks outer width so content doesn't jump
            during the 256px ↔ 64px animation */}
        <div
          className={cn(
            "flex h-full flex-col",
            sidebarOpen ? "w-64" : "w-64 md:w-16"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex h-20 shrink-0 items-center",
              sidebarOpen
                ? "justify-between px-3.5"
                : "justify-between px-3.5 md:justify-center md:px-0"
            )}
          >
            {sidebarOpen ? (
              <>
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
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                {/* On mobile, keep the "close" button since the rail
                    is a drawer; on desktop, show the "expand" button. */}
                <div className="flex h-9 w-9 items-center justify-center md:hidden">
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

                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground max-md:ml-auto md:hidden"
                  title="Close sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav
            className={cn(
              "flex flex-1 flex-col gap-1 overflow-y-auto",
              sidebarOpen ? "px-2 py-2" : "px-2 py-2 md:px-1.5"
            )}
          >
            {items.map((entry) => {
              // ---------- Standalone link ----------
              if (entry.type === "link") {
                const isActive =
                  pathname === entry.href ||
                  pathname.startsWith(entry.href + "/")
                const Icon = entry.icon

                // Collapsed on desktop: icon-only, centred, tooltip
                if (!sidebarOpen) {
                  return (
                    <div key={entry.href} className="md:flex md:justify-center">
                      <Link
                        href={entry.href}
                        title={entry.label}
                        className={cn(
                          "group relative hidden h-10 w-10 items-center justify-center rounded-md transition-colors md:flex",
                          isActive
                            ? "border border-border/80 bg-card text-foreground shadow"
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
                      </Link>

                      {/* Mobile fallback: still render the full-width row
                          because the drawer is open at w-64 there */}
                      <Link
                        href={entry.href}
                        className={cn(
                          "group relative flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors md:hidden",
                          isActive
                            ? "border border-border/80 bg-card text-foreground shadow"
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
                        <span className="truncate">{entry.label}</span>
                        {isActive && (
                          <span className="absolute -left-0.5 h-4 w-0.5 rounded-r-full bg-primary" />
                        )}
                      </Link>
                    </div>
                  )
                }

                // Expanded: full-width row
                return (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "border border-border/80 bg-card text-foreground shadow"
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
                    <span className="truncate">{entry.label}</span>
                    {isActive && (
                      <span className="absolute -left-0.5 h-4 w-0.5 rounded-r-full bg-primary" />
                    )}
                  </Link>
                )
              }

              // ---------- Collapsible group ----------
              const isExpanded = expandedGroups[entry.label]
              const GroupIcon = entry.icon

              // Collapsed on desktop: single icon button, centred, tooltip
              if (!sidebarOpen) {
                return (
                  <div key={entry.label} className="md:flex md:justify-center">
                    <button
                      onClick={() => toggleGroup(entry.label)}
                      title={entry.label}
                      className="group hidden h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground md:flex"
                    >
                      <GroupIcon className="h-4 w-4 shrink-0" />
                    </button>

                    {/* Mobile fallback: full-width group button */}
                    <button
                      onClick={() => toggleGroup(entry.label)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors md:hidden",
                        "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                        isExpanded && "text-foreground"
                      )}
                    >
                      <GroupIcon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate text-left">
                        {entry.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                  </div>
                )
              }

              // Expanded: full group with sub-items
              return (
                <div key={entry.label} className="flex flex-col gap-0.5">
                  <button
                    onClick={() => toggleGroup(entry.label)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                      "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                      isExpanded && "text-foreground"
                    )}
                  >
                    <GroupIcon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate text-left">
                      {entry.label}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="ml-2 flex flex-col gap-0.5 border-l border-border/60 pl-2">
                      {entry.items.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        const Icon = item.icon

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                              isActive
                                ? "bg-card text-foreground shadow"
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
                              <span className="absolute -left-0.5 h-4 w-0.5 rounded-r-full bg-primary" />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
