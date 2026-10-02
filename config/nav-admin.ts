import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  Calendar,
  Building2,
  CalendarCheck,
  Bell,
  ScrollText,
  Award,
  GraduationCap,
  FileText,
  CreditCard,
  Settings,
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
    icon: LayoutDashboard,
  },

  // People — who is in the system
  {
    type: "group",
    label: "People",
    icon: Users,
    items: [
      { label: "Members", href: "/admin/members", icon: Users },
      { label: "Accounts", href: "/admin/accounts", icon: UserCog },
      { label: "Coaches", href: "/admin/coaches", icon: Award },
    ],
  },

  // Academy — how the academy is structured
  {
    type: "group",
    label: "Academy",
    icon: GraduationCap,
    items: [
      { label: "Programmes", href: "/admin/programmes", icon: Calendar },
      { label: "Venues", href: "/admin/venues", icon: Building2 },
      { label: "Levels", href: "/admin/levels", icon: BookOpen },
      { label: "Curriculum", href: "/admin/curriculum", icon: FileText },
    ],
  },

  // Operations — day-to-day running
  {
    type: "group",
    label: "Operations",
    icon: CalendarCheck,
    items: [
      {
        label: "Appointments",
        href: "/admin/appointments",
        icon: CalendarCheck,
      },
      { label: "Finance", href: "/admin/finance", icon: CreditCard },
    ],
  },

  // System — academy-wide config and records
  {
    type: "group",
    label: "System",
    icon: Settings,
    items: [
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
      { label: "Audit Log", href: "/admin/audit", icon: ScrollText },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
]
