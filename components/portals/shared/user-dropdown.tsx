"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Users,
  SunMoon,
  Sun,
  Moon,
  Monitor,
  LogOut,
  ExternalLink,
  Settings,
  CreditCard,
  Layers,
  HelpCircle,
  Keyboard,
} from "lucide-react"
import { useTheme } from "next-themes"
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

export function UserDropdown({ user }: { user: SupabaseUser | null }) {
  const router = useRouter()
  const supabase = createClient()
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
          <DropdownMenuLabel className="text-xs tracking-wide text-muted-foreground uppercase">
            Account
          </DropdownMenuLabel>

          <div className="flex items-center gap-3 px-2 py-2">
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
              <span className="truncate text-sm text-foreground">
                {fullName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
            </div>
          </div>

          <DropdownMenuItem>
            <Link href="/members/new" className="w-full cursor-pointer">
              Add a member
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link
              href="/settings"
              className="flex w-full cursor-pointer justify-between"
            >
              <span>Manage account</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs tracking-wide text-muted-foreground uppercase">
            TYGA
          </DropdownMenuLabel>

          <DropdownMenuItem>
            <Link
              href="/settings"
              className="flex w-full cursor-pointer items-center gap-2"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link
              href="/billing"
              className="flex w-full cursor-pointer items-center gap-2"
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Billing & invoices
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link
              href="/integrations"
              className="flex w-full cursor-pointer items-center gap-2"
            >
              <Layers className="h-4 w-4 text-muted-foreground" />
              Integrations
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunMoon className="h-4 w-4 text-muted-foreground" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent side="left" className="mr-4 w-40">
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
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
          <Link
            href="/golfers/enroll"
            className="flex w-full cursor-pointer items-center gap-2"
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            Enroll a golfer
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link
              href="/help"
              className="flex w-full cursor-pointer items-center gap-2"
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Help
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link
              href="/shortcuts"
              className="flex w-full cursor-pointer items-center gap-2"
            >
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              Shortcuts
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="h-4 w-4 text-muted-foreground" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
