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
  ClipboardList,
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
  {
    type: "link",
    label: "Overview",
    href: "/admin/overview",
    icon: LayoutDashboard,
  },
  { type: "link", label: "Members", href: "/admin/members", icon: Users },
  { type: "link", label: "Accounts", href: "/admin/accounts", icon: UserCog },
  { type: "link", label: "Coaches", href: "/admin/coaches", icon: Award },

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

  {
    type: "link",
    label: "Appointments",
    href: "/admin/appointments",
    icon: CalendarCheck,
  },

  { type: "link", label: "Finance", href: "/admin/finance", icon: CreditCard },
  {
    type: "link",
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  { type: "link", label: "Audit Log", href: "/admin/audit", icon: ScrollText },
]
