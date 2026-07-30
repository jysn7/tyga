"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronsUpDown, Check, PlusCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type NavItem = { label: string; href: string; icon: LucideIcon }

const mockMembers = [
  { id: "1", name: "James Doe", role: "Parent / Primary", initials: "JD" },
  { id: "2", name: "Emma Doe", role: "Child", initials: "ED" },
  { id: "3", name: "Liam Johnson", role: "Child", initials: "LJ" },
]

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(mockMembers[0])
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-border bg-card">
      {/* Brand / Logo Header */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          T
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-none font-semibold text-foreground">
            TYGA
          </span>
          <span className="text-[10px] text-muted-foreground">Portal</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-4">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 h-4 w-[2px] rounded-full bg-primary transition-opacity",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              />
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Switch Member Footer */}
      <div
        className="relative shrink-0 border-t border-border p-3"
        ref={dropdownRef}
      >
        {isOpen && (
          <div className="absolute right-3 bottom-full left-3 z-50 mb-2 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
            <div className="px-2 py-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
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
          className="flex w-full items-center justify-between rounded-md border border-border p-2 transition-colors outline-none hover:bg-secondary"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="h-7 w-7 shrink-0 rounded-md border border-border">
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
    </aside>
  )
}
