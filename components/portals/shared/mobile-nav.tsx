"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MoreHorizontal } from "lucide-react"
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

  // Reserve the last slot for "More" when there are extras
  const hasExtras = flatLinks.length > 4
  const primaryLinks = hasExtras ? flatLinks.slice(0, 4) : flatLinks
  const extraLinks = hasExtras ? flatLinks.slice(4) : []

  // Match whole path segments so "/members" doesn't match "/members-archive"
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/")

  const extraActive = extraLinks.some((l) => isActive(l.href))

  return (
    <>
      {/* Backdrop for the sheet */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-background/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Overflow sheet — slides up from behind the tab bar */}
      {extraLinks.length > 0 && (
        <div
          id="mobile-nav-sheet"
          aria-hidden={!open}
          className={`fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+64px)] z-40 px-2 transition-all duration-300 ease-out md:hidden ${
            open
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-lg overflow-hidden rounded-t-2xl border border-b-0 border-border/60 bg-card shadow-xl shadow-black/20">
            <div className="max-h-[55vh] overflow-y-auto p-3">
              <div className="mb-2 px-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                More
              </div>
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
                      className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-all duration-300 active:scale-95 ${
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

      {/* Bottom tab bar — full-bleed, flush with safe area */}
      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex h-16 max-w-lg items-stretch">
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
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 px-1 transition-colors active:bg-accent/40 ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-foreground" />
                )}
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.75} />
                <span
                  className={`w-full truncate text-center text-[10px] leading-none ${
                    active ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* More — same 5th slot, same indicator */}
          {extraLinks.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "More"}
              aria-expanded={open}
              aria-controls="mobile-nav-sheet"
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 px-1 transition-colors active:bg-accent/40 ${
                extraActive && !open
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {((extraActive && !open) || open) && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-foreground" />
              )}
              <MoreHorizontal
                className="h-5 w-5"
                strokeWidth={extraActive ? 2 : 1.75}
              />
              <span
                className={`w-full truncate text-center text-[10px] leading-none ${
                  extraActive ? "font-semibold" : "font-medium"
                }`}
              >
                More
              </span>
              {extraActive && !open && (
                <span className="absolute top-2 right-[calc(50%-14px)] h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
