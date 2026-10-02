import {
  Home,
  Users,
  Bell,
  Settings,
  CreditCard,
  Trophy,
  CalendarDays,
  CalendarClock,
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
  { type: "link", label: "Dashboard", href: "/dashboard", icon: Home },
  { type: "link", label: "My Members", href: "/members", icon: Users },

  // Golf group — programmes + schedule + appointments
  {
    type: "group",
    label: "Golf",
    icon: Trophy,
    items: [
      { label: "Programmes", href: "/programmes", icon: Trophy },
      { label: "My Schedule", href: "/my-schedule", icon: CalendarDays },
      {
        label: "My Appointments",
        href: "/my-appointments",
        icon: CalendarClock,
      },
    ],
  },

  // Billing — one entry, two tabs inside
  { type: "link", label: "Billing", href: "/billing", icon: CreditCard },

  // Standalone
  { type: "link", label: "Notifications", href: "/notifications", icon: Bell },
  { type: "link", label: "Settings", href: "/settings", icon: Settings },
]
