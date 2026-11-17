"use client"

import { useState } from "react"
import type { SyntheticEvent } from "react"
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

type RailTip = { label: string; top: number; left: number }

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

  // Floating label for the collapsed desktop rail. Uses fixed positioning so
  // the aside's overflow-hidden doesn't clip it.
  const [tip, setTip] = useState<RailTip | null>(null)

  const showTip = (label: string) => (e: SyntheticEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setTip({ label, top: r.top + r.height / 2, left: r.right + 12 })
  }
  const hideTip = () => setTip(null)
  const tipHandlers = (label: string) => ({
    onMouseEnter: showTip(label),
    onMouseLeave: hideTip,
    onFocus: showTip(label),
    onBlur: hideTip,
  })

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
      hideTip()
      toggleSidebar()
      setExpandedGroups((prev) => ({ ...prev, [label]: true }))
      return
    }
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const handleToggleSidebar = () => {
    hideTip()
    toggleSidebar()
  }

  const avatarInitial = (user?.email?.[0] ?? "T").toUpperCase()

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Collapsed-rail tooltip (desktop only) */}
      {!sidebarOpen && tip && (
        <div
          role="tooltip"
          style={{ top: tip.top, left: tip.left }}
          className="pointer-events-none fixed z-50 hidden -translate-y-1/2 rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-foreground shadow-lg md:block"
        >
          {tip.label}
        </div>
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
                    is a drawer; on desktop, show the logo that morphs
                    into the "expand" button on hover. */}
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

                {/* Desktop collapsed: logo ↔ expand icon crossfade */}
                <button
                  type="button"
                  onClick={handleToggleSidebar}
                  aria-label="Expand sidebar"
                  {...tipHandlers("Expand sidebar")}
                  className="group relative hidden h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground focus-visible:ring-1 focus-visible:ring-border focus-visible:outline-none md:flex"
                >
                  <span className="absolute inset-0 flex items-center justify-center transition-all duration-200 group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0">
                    {resolvedTheme && (
                      <Image
                        width={28}
                        height={28}
                        alt="TYGA Logo"
                        src={logoSrc}
                        className="h-7 w-7 object-contain"
                        priority
                      />
                    )}
                  </span>
                  <PanelLeftOpen className="absolute h-4 w-4 scale-75 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100" />
                </button>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav
            className={cn(
              "flex flex-1 flex-col gap-1 overflow-y-auto",
              sidebarOpen ? "px-2 py-2" : "px-2 py-2 md:gap-1.5 md:px-1.5"
            )}
          >
            {/* Collapsed divider */}
            {!sidebarOpen && (
              <div className="mx-auto mb-1 hidden h-px w-6 bg-border/60 md:block" />
            )}

            {items.map((entry) => {
              // ---------- Standalone link ----------
              if (entry.type === "link") {
                const isActive =
                  pathname === entry.href ||
                  pathname.startsWith(entry.href + "/")
                const Icon = entry.icon

                // Collapsed on desktop: icon tile, centred, flyout label
                if (!sidebarOpen) {
                  return (
                    <div key={entry.href} className="md:flex md:justify-center">
                      <Link
                        href={entry.href}
                        aria-label={entry.label}
                        {...tipHandlers(entry.label)}
                        className={cn(
                          "group relative hidden h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 focus-visible:ring-1 focus-visible:ring-border focus-visible:outline-none md:flex",
                          isActive
                            ? "bg-card text-foreground shadow ring-1 ring-border/80"
                            : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-all duration-200 group-hover:scale-110",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        {isActive && (
                          <span className="absolute -left-3 h-5 w-1 rounded-r-full bg-primary" />
                        )}
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
              const groupHasActive = entry.items.some((item) =>
                pathname.startsWith(item.href)
              )

              // Collapsed on desktop: icon tile, centred, flyout label
              if (!sidebarOpen) {
                return (
                  <div key={entry.label} className="md:flex md:justify-center">
                    <button
                      onClick={() => toggleGroup(entry.label)}
                      aria-label={entry.label}
                      {...tipHandlers(entry.label)}
                      className={cn(
                        "group relative hidden h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 focus-visible:ring-1 focus-visible:ring-border focus-visible:outline-none md:flex",
                        groupHasActive
                          ? "bg-card text-foreground shadow ring-1 ring-border/80"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                      )}
                    >
                      <GroupIcon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-all duration-200 group-hover:scale-110",
                          groupHasActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {/* Dot hints that this tile opens a group */}
                      <span
                        className={cn(
                          "absolute right-1.5 bottom-1.5 h-1 w-1 rounded-full transition-colors",
                          groupHasActive
                            ? "bg-primary"
                            : "bg-muted-foreground/50 group-hover:bg-foreground/70"
                        )}
                      />
                      {groupHasActive && (
                        <span className="absolute -left-3 h-5 w-1 rounded-r-full bg-primary" />
                      )}
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

          {/* Collapsed footer: user avatar tile (desktop only) */}
          {!sidebarOpen && (
            <div className="hidden shrink-0 items-center justify-center pt-2 pb-4 md:flex">
              <div
                tabIndex={0}
                {...tipHandlers(user ? user.email || "Member" : "Portal")}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-semibold text-foreground ring-1 ring-border/60 transition-all duration-200 hover:ring-border focus-visible:ring-border focus-visible:outline-none"
              >
                {avatarInitial}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
