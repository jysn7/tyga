"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"
import type { NavEntry, NavItem } from "./sidebar"

export function MobileNav({ items }: { items: NavEntry[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  // Flatten groups → individual links
  const flatLinks: NavItem[] = items.flatMap((entry) =>
    entry.type === "link" ? [entry] : entry.items
  )

  const primaryLinks = flatLinks.slice(0, 4)
  const extraLinks = flatLinks.slice(4)

  // Match whole path segments so "/members" doesn't match "/members-archive"
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/")

  const extraActive = extraLinks.some((l) => isActive(l.href))

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-background/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] md:hidden"
      >
        <div className="flex w-full max-w-md items-center gap-2">
          {/* Bubble */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-border bg-card/80 shadow-lg shadow-black/50 backdrop-blur-xl">
            {/* Expandable panel (sits above the primary row, so the row never moves) */}
            {extraLinks.length > 0 && (
              <div
                id="mobile-nav-panel"
                aria-hidden={!open}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="max-h-[55vh] overflow-y-auto border-b border-border/60 p-2">
                    <div className="grid grid-cols-3 gap-1">
                      {extraLinks.map((item, i) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            tabIndex={open ? 0 : -1}
                            aria-current={active ? "page" : undefined}
                            style={{
                              transitionDelay: open ? `${i * 25}ms` : "0ms",
                            }}
                            className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center transition-all duration-300 active:scale-95 ${
                              open
                                ? "translate-y-0 opacity-100"
                                : "translate-y-2 opacity-0"
                            } ${
                              active
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-5 w-5" strokeWidth={1.75} />
                            <span className="line-clamp-2 text-[11px] leading-tight font-medium">
                              {item.label}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Primary row: icon always visible, label only on the active item */}
            <div className="flex items-center justify-around gap-1 p-1.5">
              {primaryLinks.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-1 transition-all duration-200 active:scale-95 ${
                      active
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.75} />
                    {active && (
                      <span className="w-full truncate text-center text-[10px] leading-none font-medium">
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Toggle button */}
          {extraLinks.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "More links"}
              aria-expanded={open}
              aria-controls="mobile-nav-panel"
              className="relative mb-0 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border/60 bg-foreground text-background shadow-xl shadow-black/10 transition-transform duration-300 active:scale-95"
            >
              <Plus
                className={`h-5 w-5 transition-transform duration-300 ${
                  open ? "rotate-45" : "rotate-0"
                }`}
                strokeWidth={2}
              />
              {/* Dot when the current page lives in the hidden section */}
              {extraActive && !open && (
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary ring-2 ring-foreground dark:bg-pink" />
              )}
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
