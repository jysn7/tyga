import {
  Home,
  Users,
  Bell,
  Settings,
  CalendarClock,
  MessageCircle,
  LifeBuoy,
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
    label: "My sessions",
    href: "/coach/dashboard",
    icon: Home,
  },
  {
    type: "link",
    label: "My Appointments",
    href: "/coach/appointments",
    icon: CalendarClock,
  },
  {
    type: "link",
    label: "My students",
    href: "/coach/my-students",
    icon: Users,
  },
  {
    type: "link",
    label: "Messages",
    href: "/coach/messages",
    icon: MessageCircle,
  },
  {
    type: "link",
    label: "Support",
    href: "/coach/support",
    icon: LifeBuoy,
  },
  {
    type: "link",
    label: "Notifications",
    href: "/coach/notifications",
    icon: Bell,
  },
  { type: "link", label: "Settings", href: "/coach/settings", icon: Settings },
]
