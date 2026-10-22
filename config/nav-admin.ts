import {
  House,
  Users,
  KeyRound,
  UserCheck,
  GraduationCap,
  Layers,
  MapPin,
  TrendingUp,
  BookOpen,
  ClipboardList,
  CalendarClock,
  CalendarDays,
  Wallet,
  ClipboardCheck,
  SlidersHorizontal,
  Bell,
  History,
  Settings,
  Megaphone,
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

export const adminNav: NavEntry[] = [
  // Standalone
  {
    type: "link",
    label: "Overview",
    href: "/admin/overview",
    icon: House,
  },

  // People — who is in the system
  {
    type: "group",
    label: "People",
    icon: Users,
    items: [
      { label: "Members", href: "/admin/members", icon: Users },
      { label: "Accounts", href: "/admin/accounts", icon: KeyRound },
      { label: "Coaches", href: "/admin/coaches", icon: UserCheck },
    ],
  },

  // Academy — how the academy is structured
  {
    type: "group",
    label: "Academy",
    icon: GraduationCap,
    items: [
      { label: "Programmes", href: "/admin/programmes", icon: Layers },
      { label: "Events", href: "/admin/events", icon: CalendarDays },
      { label: "Venues", href: "/admin/venues", icon: MapPin },
      { label: "Levels", href: "/admin/levels", icon: TrendingUp },
      { label: "Curriculum", href: "/admin/curriculum", icon: BookOpen },
    ],
  },

  // Operations — day-to-day running
  {
    type: "group",
    label: "Operations",
    icon: ClipboardList,
    items: [
      {
        label: "Enrollments",
        href: "/admin/enrollments",
        icon: ClipboardCheck,
      },
      {
        label: "Appointments",
        href: "/admin/appointments",
        icon: CalendarClock,
      },
      { label: "Finance", href: "/admin/finance", icon: Wallet },
      { label: "Tickets", href: "/admin/tickets", icon: LifeBuoy },
    ],
  },

  // Marketing — standalone, its own public-facing surface
  {
    type: "link",
    label: "Marketing Site",
    href: "/admin/marketing", // fixed typo: markteting → marketing
    icon: Megaphone,
  },

  // System — admin-only config and records
  {
    type: "group",
    label: "System",
    icon: SlidersHorizontal,
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Audit Log", href: "/admin/audit", icon: History },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
]
