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
  label: string
  icon: LucideIcon
  items: NavItem[]
}

export const adminNav: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
      { label: "Audit Log", href: "/admin/audit", icon: ScrollText },
    ],
  },
  {
    label: "People",
    icon: Users,
    items: [
      { label: "Members", href: "/admin/members", icon: Users },
      { label: "Accounts", href: "/admin/accounts", icon: UserCog },
      { label: "Coaches", href: "/admin/coaches", icon: Award },
    ],
  },
  {
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
    label: "Operations",
    icon: ClipboardList,
    items: [
      {
        label: "Appointments",
        href: "/admin/appointments",
        icon: CalendarCheck,
      },
    ],
  },
  {
    label: "System",
    icon: Settings,
    items: [
      { label: "Finance", href: "/admin/finance", icon: CreditCard },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
    ],
  },
]
