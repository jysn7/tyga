"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppStore } from "@/stores/useAppStore"
import {
  ChevronsUpDown,
  Check,
  PlusCircle,
  Search,
  PanelLeftClose,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type NavItem = { label: string; href: string; icon: LucideIcon }

const mockMembers = [
  { id: "1", name: "James Doe", role: "Parent / Primary", initials: "JD" },
  { id: "2", name: "Emma Doe", role: "Child", initials: "ED" },
  { id: "3", name: "Liam Johnson", role: "Child", initials: "LJ" },
]

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState(mockMembers[0])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth < 768) {
      useAppStore.setState({ sidebarOpen: false })
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                T
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs leading-none font-semibold tracking-tight text-foreground">
                  TYGA
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Portal
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

          {/* Member Selector Footer */}
          <div className="relative shrink-0 p-2" ref={dropdownRef}>
            {isOpen && (
              <div className="absolute right-2 bottom-full left-2 z-50 mb-2 rounded-md bg-secondary p-1 shadow">
                <div className="px-2 py-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  Switch Member
                </div>
                <div className="my-1 h-px bg-border" />
                <div className="flex flex-col gap-0.5">
                  {mockMembers.map((member) => {
                    const isSelected = member.id === selectedMember.id
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setSelectedMember(member)
                          setIsOpen(false)
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Avatar className="h-6 w-6 shrink-0 rounded-md border border-border">
                            <AvatarFallback className="bg-secondary text-[10px] font-medium text-foreground">
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col truncate">
                            <span className="truncate font-medium">
                              {member.name}
                            </span>
                            <span className="truncate text-[10px] text-muted-foreground">
                              {member.role}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Add new member</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex w-full items-center justify-between rounded-md bg-secondary p-2 shadow transition-colors outline-none hover:bg-secondary"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Avatar className="h-6 w-6 shrink-0 rounded-md border border-border">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {selectedMember.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate text-left">
                  <span className="truncate text-xs font-medium text-foreground">
                    {selectedMember.name}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    {selectedMember.role}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
