import {
  Home,
  Users,
  Calendar,
  Bell,
  Settings,
  GraduationCap,
  CalendarDays,
  CalendarClock,
  TrendingUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const coachNav: NavItem[] = [
  { label: "Dashboard", href: "/coach/dashboard", icon: Home },
  { label: "My Schedule", href: "/coach/my-schedule", icon: CalendarDays },
  {
    label: "My Appointments",
    href: "/coach/appointments",
    icon: CalendarClock,
  },
  { label: "My Roster", href: "/coach/roster", icon: Users },
  {
    label: "Progressions",
    href: "/coach/progressions",
    icon: TrendingUp,
  },
  { label: "Notifications", href: "/coach/notifications", icon: Bell },
  { label: "Settings", href: "/coach/settings", icon: Settings },
]
