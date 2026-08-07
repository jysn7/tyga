"use client"

import {
  Bell,
  PanelLeftOpen,
  User,
  Users,
  SunMoon,
  Sun,
  Moon,
  Monitor,
  LogOut,
  ExternalLink,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAppStore } from "@/stores/useAppStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"
import type { User as SupabaseUser } from "@supabase/supabase-js"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function LayoutHeader({ user }: { user: SupabaseUser | null }) {
  const router = useRouter()
  const supabase = createClient()
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const { theme, setTheme } = useTheme()

  const fullName = user?.user_metadata?.full_name || user?.email || "User"
  const email = user?.email || ""

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push("/auth/signin")
      toast.add({
        title: "Signed out",
        description: "You have been signed out successfully.",
        type: "success",
      })
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to sign out.",
        type: "error",
      })
    }
  }

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
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {fullName ? (
                  getInitials(fullName)
                ) : (
                  <User className="h-4.5 w-4.5" />
                )}
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
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {fullName ? (
                      getInitials(fullName)
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium text-foreground">
                    {fullName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
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

            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
