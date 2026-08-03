"use client"

import {
  Bell,
  PanelLeftOpen,
  User,
  Users,
  UserCog,
  Settings,
  Plug,
  Receipt,
  SunMoon,
  Sun,
  Moon,
  Monitor,
  Flag,
  HelpCircle,
  Command,
  LogOut,
  ExternalLink,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAppStore } from "@/stores/useAppStore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample data — replace with the account row fetched in the layout
// (`select * from accounts where id = auth.uid()`) and passed down as a prop.
const account = {
  fullName: "Thandiwe Mokoena",
  email: "thandiwe@example.com",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export function LayoutHeader() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 flex h-18 shrink-0 items-center justify-between rounded-t-xl bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        {!sidebarOpen && (
          <button
            type="button"
            onClick={toggleSidebar}
            title="Open sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          title="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            title="Account"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-accent"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-pink text-primary-foreground">
                <User className="h-4.5 w-4.5" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-76 py-4">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Account
              </DropdownMenuLabel>

              <div className="flex items-center gap-3 px-2 py-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-pink text-primary-foreground">
                    {getInitials(account.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium text-foreground">
                    {account.fullName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {account.email}
                  </span>
                </div>
              </div>

              <DropdownMenuItem className="py-2">
                Switch member
              </DropdownMenuItem>
              <DropdownMenuItem className="flex justify-between py-2">
                <span>Manage account</span>
                <ExternalLink className="h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                TYGA
              </DropdownMenuLabel>

              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing & invoices</DropdownMenuItem>
              <DropdownMenuItem>Integrations</DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <SunMoon className="h-4 w-4 text-muted-foreground" />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent side="left" className="mr-4 w-40">
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={setTheme}
                  >
                    <DropdownMenuRadioItem value="light">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem>
              <Users className="h-4 w-4 text-muted-foreground" />
              Enroll a golfer
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuGroup>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuItem>Shortcuts</DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
