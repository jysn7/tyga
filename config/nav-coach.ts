import {
  Home,
  ClipboardList,
  Users,
  Calendar,
  UserCog,
  Settings,
  Bell,
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

export const coachNav: NavGroup[] = [
  {
    type: "group",
    label: "Dashboard",
    icon: Home,
    items: [{ label: "Overview", href: "/coach/overview", icon: Home }],
  },
  {
    type: "group",
    label: "Coaching",
    icon: ClipboardList,
    items: [
      { label: "My Sessions", href: "/coach/sessions", icon: Calendar },
      { label: "My Roster", href: "/coach/roster", icon: Users },
    ],
  },
  {
    type: "group",
    label: "People",
    icon: Users,
    items: [
      { label: "Members", href: "/coach/members", icon: Users },
      { label: "Appointments", href: "/coach/appointments", icon: Calendar },
    ],
  },
  {
    type: "group",
    label: "System",
    icon: Settings,
    items: [
      { label: "Profile", href: "/coach/profile", icon: UserCog },
      { label: "Notifications", href: "/coach/notifications", icon: Bell },
    ],
  },
]
