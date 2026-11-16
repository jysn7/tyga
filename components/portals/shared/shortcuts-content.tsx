"use client"

import { useAppStore, type Role } from "@/stores/useAppStore"

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-foreground shadow-sm">
      {children}
    </kbd>
  )
}

function Combo({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {keys.map((k, i) => (
        <span key={i} className="flex items-center gap-0.5">
          {i > 0 && (
            <span className="text-[9px] text-muted-foreground">
              {keys.length === 2 && keys[0].length === 1 ? "then" : "+"}
            </span>
          )}
          <Kbd>{k === "?" ? "?" : k.toUpperCase()}</Kbd>
        </span>
      ))}
    </div>
  )
}

function ShortcutRow({
  shortcut,
  description,
}: {
  shortcut: React.ReactNode
  description: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="flex-1 truncate text-xs text-foreground">
        {description}
      </div>
      <div className="shrink-0">{shortcut}</div>
    </div>
  )
}

function Group({
  title,
  items,
}: {
  title: string
  items: { keys: string[]; label: string }[]
}) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col">
      <h3 className="mb-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="flex flex-col divide-y divide-border/50">
        {items.map((s) => (
          <ShortcutRow
            key={s.keys.join("-")}
            shortcut={<Combo keys={s.keys} />}
            description={s.label}
          />
        ))}
      </div>
    </div>
  )
}

const NAV_SHORTCUTS = [
  {
    keys: ["g", "d"],
    label: "Dashboard",
    roles: ["parent", "coach", "admin"] as Role[],
  },
  {
    keys: ["g", "p"],
    label: "Programmes",
    roles: ["parent", "coach", "admin"] as Role[],
  },
  {
    keys: ["g", "n"],
    label: "Notifications",
    roles: ["parent", "coach", "admin"] as Role[],
  },
  {
    keys: ["g", "s"],
    label: "Settings",
    roles: ["parent", "coach", "admin"] as Role[],
  },
  {
    keys: ["g", "h"],
    label: "Help",
    roles: ["parent", "coach", "admin"] as Role[],
  },
  {
    keys: ["g", "m"],
    label: "My members / students",
    roles: ["parent", "coach", "admin"] as Role[],
  },
  { keys: ["g", "b"], label: "Billing", roles: ["parent"] as Role[] },
  { keys: ["g", "w"], label: "Waiting lists", roles: ["parent"] as Role[] },
  { keys: ["g", "c"], label: "Coach dashboard", roles: ["coach"] as Role[] },
  {
    keys: ["g", "a"],
    label: "My appointments (coach)",
    roles: ["coach"] as Role[],
  },
  { keys: ["g", "e"], label: "Enrolments (admin)", roles: ["admin"] as Role[] },
  { keys: ["g", "f"], label: "Finance (admin)", roles: ["admin"] as Role[] },
  { keys: ["g", "t"], label: "Tickets (admin)", roles: ["admin"] as Role[] },
  { keys: ["g", "x"], label: "System (admin)", roles: ["admin"] as Role[] },
]

const GENERAL_SHORTCUTS = [
  { keys: ["?"], label: "Open this shortcuts panel" },
  { keys: ["esc"], label: "Close dialogs and panels" },
]

export function ShortcutsContent() {
  const account = useAppStore((s) => s.account)
  const role: Role = account?.role ?? "parent"

  const visibleNav = NAV_SHORTCUTS.filter((s) => s.roles.includes(role))

  const mid = Math.ceil(visibleNav.length / 2)
  const navLeft = visibleNav.slice(0, mid)
  const navRight = visibleNav.slice(mid)

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
      {/* Left column */}
      <div className="flex flex-col gap-6">
        <Group title="Navigation" items={navLeft} />
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-6">
        {navRight.length > 0 && (
          <div className="flex flex-col">
            <h3 className="mb-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Navigation{" "}
              <span className="font-normal normal-case">(continued)</span>
            </h3>
            <div className="flex flex-col divide-y divide-border/50">
              {navRight.map((s) => (
                <ShortcutRow
                  key={s.keys.join("-")}
                  shortcut={<Combo keys={s.keys} />}
                  description={s.label}
                />
              ))}
            </div>
          </div>
        )}

        <Group title="General" items={GENERAL_SHORTCUTS} />
      </div>

      {/* Footnote — spans both columns */}
      <p className="text-[11px] text-muted-foreground sm:col-span-2">
        Shortcuts work on desktop. On mobile, navigate using the sidebar.
      </p>
    </div>
  )
}
