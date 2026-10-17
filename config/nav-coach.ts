import {
  Home,
  Users,
  Bell,
  Settings,
  CalendarClock,
  TrendingUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  type: "link"
  label: string
  href: string
  icon: LucideIcon
}

export const coachNav: NavItem[] = [
  {
    type: "link",
    label: "Dashboard",
    href: "/coach/dashboard",
    icon: Home,
  },
  {
    type: "link",
    label: "My Appointments",
    href: "/coach/appointments",
    icon: CalendarClock,
  },
  { type: "link", label: "My Roster", href: "/coach/roster", icon: Users },
  {
    type: "link",
    label: "Progressions",
    href: "/coach/progressions",
    icon: TrendingUp,
  },
  {
    type: "link",
    label: "Notifications",
    href: "/coach/notifications",
    icon: Bell,
  },
  { type: "link", label: "Settings", href: "/coach/settings", icon: Settings },
]
