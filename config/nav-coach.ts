import {
  Home,
  Users,
  Calendar,
  Bell,
  Settings,
  ClipboardList,
  GraduationCap,
  Trophy,
  Clock,
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

export const coachNav: NavEntry[] = [
  // Standalone
  { type: "link", label: "Dashboard", href: "/coach/overview", icon: Home },
  {
    type: "link",
    label: "My Sessions",
    href: "/coach/sessions",
    icon: Calendar,
  },
  { type: "link", label: "My Roster", href: "/coach/roster", icon: Users },

  // Coaching group
  {
    type: "group",
    label: "Coaching",
    icon: ClipboardList,
    items: [
      { label: "Programmes", href: "/coach/programmes", icon: GraduationCap },
      { label: "Achievements", href: "/coach/achievements", icon: Trophy },
    ],
  },

  // People group
  {
    type: "group",
    label: "People",
    icon: Users,
    items: [
      { label: "Members", href: "/coach/members", icon: Users },
      { label: "Appointments", href: "/coach/appointments", icon: Clock },
    ],
  },

  // Standalone
  {
    type: "link",
    label: "Notifications",
    href: "/coach/notifications",
    icon: Bell,
  },
  { type: "link", label: "Settings", href: "/coach/settings", icon: Settings },
]
