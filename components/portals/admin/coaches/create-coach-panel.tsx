"use client"

import { useState } from "react"
import { Search, UserPlus, Users, X } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/components/ui/toast"
import { useAccounts, type Account } from "@/hooks/admin/use-accounts"
import {
  useCreateCoach,
  type CreateCoachInput,
} from "@/hooks/admin/use-create-coach"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

const COACH_TYPE_OPTIONS: {
  label: string
  value: NonNullable<CreateCoachInput["coachType"]>
}[] = [
  { label: "Head coach", value: "head_coach" },
  { label: "Assistant", value: "assistant_coach" },
  { label: "Volunteer", value: "volunteer" },
]

export function CreateCoachPanel({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [coachType, setCoachType] = useState<string>("")
  const [maxRatio, setMaxRatio] = useState("")

  const { data: accounts, isLoading } = useAccounts({
    role: "parent",
    active: true,
    search: debouncedSearch || undefined,
  })

  const createCoach = useCreateCoach()

  function reset() {
    setSearchInput("")
    setSelectedAccount(null)
    setCoachType("")
    setMaxRatio("")
  }

  async function handleSubmit() {
    if (!selectedAccount) return

    try {
      await createCoach.mutateAsync({
        accountId: selectedAccount.id,
        coachType: coachType
          ? (coachType as CreateCoachInput["coachType"])
          : undefined,
        maxStudentRatio: maxRatio ? Number(maxRatio) : undefined,
      })

      toast.add({
        title: "Coach created",
        description: `${selectedAccount.fullName} is now a coach.`,
        type: "success",
        timeout: 4000,
      })

      reset()
      onOpenChange(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to create coach",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <SidePanel
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
      title="Add coach"
      header={
        <div className="flex items-center gap-4 px-8 pt-8 pb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted/80">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Add coach
            </span>
            <span className="text-sm text-muted-foreground">
              Promote an existing parent account to coach
            </span>
          </div>
        </div>
      }
      footer={
        <Button
          className="w-full rounded-lg text-sm"
          disabled={!selectedAccount || createCoach.isPending}
          onClick={handleSubmit}
        >
          {createCoach.isPending ? "Creating..." : "Create coach"}
        </Button>
      }
    >
      {!selectedAccount ? (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search parent accounts by name or email..."
              autoComplete="off"
              maxLength={100}
              className="h-11 rounded-xl pl-9 text-sm"
              autoFocus
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5"
                >
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                    <div className="h-2.5 w-40 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : accounts && accounts.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setSelectedAccount(account)}
                  className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-accent/60"
                >
                  <Avatar className="h-9 w-9 shrink-0 rounded-full">
                    <AvatarFallback className="cursor-pointer bg-blue text-xs font-medium text-primary-foreground transition-colors group-hover:bg-blue/10 group-hover:text-primary">
                      {getInitials(account.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {account.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {account.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Users
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.75}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {debouncedSearch
                  ? "No matching parent accounts"
                  : "Start typing to search"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          <div className="/60 flex items-center gap-3.5 rounded-xl bg-secondary p-4">
            <Avatar className="h-11 w-11 shrink-0 rounded-full">
              <AvatarFallback className="bg-blue text-sm font-semibold text-primary-foreground">
                {getInitials(selectedAccount.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {selectedAccount.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {selectedAccount.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAccount(null)}
              title="Change account"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Coach type
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {COACH_TYPE_OPTIONS.map((opt) => {
                const isSelected = coachType === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCoachType(isSelected ? "" : opt.value)}
                    className={`rounded-lg px-3 py-2.5 text-center text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <span className="text-xs text-muted-foreground">
              Optional — can be set later
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Max student ratio
            </span>
            <div className="relative">
              <Users className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                min={1}
                value={maxRatio}
                onChange={(e) => setMaxRatio(e.target.value)}
                placeholder="e.g. 8"
                className="h-11 rounded-xl pl-9 text-sm"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Maximum number of students this coach can be assigned at once
            </span>
          </div>
        </div>
      )}
    </SidePanel>
  )
}
