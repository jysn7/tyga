"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { AccountList } from "@/components/portals/admin/accounts/account-list"
import {
  useAccounts,
  type Account,
} from "@/hooks/admin/accounts/use-admin-accounts"
import { Loader } from "@/components/portals/shared/loader"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ROLE_OPTIONS: { label: string; value: Account["role"] | "all" }[] = [
  { label: "All roles", value: "all" },
  { label: "Parents", value: "parent" },
  { label: "Coaches", value: "coach" },
  { label: "Admins", value: "admin" },
]

const ACTIVE_OPTIONS: {
  label: string
  value: "all" | "active" | "inactive"
}[] = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

export default function AccountsPage() {
  const [roleFilter, setRoleFilter] = useState<Account["role"] | "all">("all")
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all")
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce the search term so we're not firing a query on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 300)
    return () => clearTimeout(handle)
  }, [searchInput])

  const {
    data: accounts,
    isLoading,
    error,
  } = useAccounts({
    role: roleFilter === "all" ? undefined : roleFilter,
    active: activeFilter === "all" ? undefined : activeFilter === "active",
    search: debouncedSearch || undefined,
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts"
        description="Manage user roles and account status across the academy"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 rounded-lg border border-border bg-input sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            maxLength={100}
            autoComplete="off"
            className="h-9 pl-8 text-sm"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}
        >
          <SelectTrigger className="h-9 w-full rounded-lg border-border bg-card text-sm sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as typeof activeFilter)}
        >
          <SelectTrigger className="h-9 w-full rounded-lg border-border bg-card text-sm sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIVE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-full w-full justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Error: {error.message}</div>
      ) : (
        <AccountList accounts={accounts ?? []} />
      )}
    </div>
  )
}
