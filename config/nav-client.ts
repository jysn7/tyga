import {
  House,
  Users,
  Bell,
  Settings,
  Wallet,
  Layers,
  CalendarDays,
  CalendarClock,
  Flag,
  MessageCircle,
  LifeBuoy,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

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

export const clientNav: NavEntry[] = [
  // Standalone
  { type: "link", label: "Dashboard", href: "/dashboard", icon: House },
  { type: "link", label: "My Members", href: "/members", icon: Users },

  // Golf group: programmes + schedule + appointments
  {
    type: "group",
    label: "Golf",
    icon: Flag,
    items: [
      { label: "Programmes", href: "/programmes", icon: Layers },
      { label: "My Schedule", href: "/my-schedule", icon: CalendarDays },
      {
        label: "My Appointments",
        href: "/my-appointments",
        icon: CalendarClock,
      },
    ],
  },

  // Billing: one entry, two tabs inside
  { type: "link", label: "Billing", href: "/billing", icon: Wallet },

  // Communication: messages + support side by side
  {
    type: "group",
    label: "Communication",
    icon: MessageCircle,
    items: [
      { label: "Messages", href: "/messages", icon: MessageCircle },
      { label: "Support", href: "/support", icon: LifeBuoy },
    ],
  },

  // Standalone
  { type: "link", label: "Notifications", href: "/notifications", icon: Bell },
  { type: "link", label: "Settings", href: "/settings", icon: Settings },
]
