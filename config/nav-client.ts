import {
  Home,
  Users,
  Calendar,
  Receipt,
  Bell,
  Settings,
  Clock,
} from "lucide-react"

export const clientNav = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "My Members", href: "/members", icon: Users },
  { label: "Programmes", href: "/programmes", icon: Calendar },
  { label: "Schedule", href: "/schedule", icon: Clock },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
]
