import {
  Home,
  Users,
  Calendar,
  Receipt,
  Bell,
  Settings,
  Clock,
  UserCog,
  Wallet,
  CreditCard,
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

export const clientNav: NavGroup[] = [
  {
    label: "Dashboard",
    icon: Home,
    items: [{ label: "Overview", href: "/dashboard", icon: Home }],
  },
  {
    label: "Family",
    icon: Users,
    items: [{ label: "My Members", href: "/members", icon: Users }],
  },
  {
    label: "Golf",
    icon: Calendar,
    items: [
      { label: "Programmes", href: "/programmes", icon: Calendar },
      { label: "Schedule", href: "/schedule", icon: Clock },
    ],
  },
  {
    label: "Finance",
    icon: Wallet,
    items: [
      { label: "Invoices", href: "/invoices", icon: Receipt },
      { label: "Payments", href: "/payments", icon: CreditCard },
    ],
  },
  {
    label: "System",
    icon: Settings,
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Settings", href: "/settings", icon: UserCog },
    ],
  },
]
