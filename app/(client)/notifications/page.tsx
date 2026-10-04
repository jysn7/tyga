"use client"

import { useState } from "react"
import { Check, Loader2, X } from "lucide-react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { Loader } from "@/components/portals/shared/loader"
import { NotificationList } from "@/components/portals/client/notifications/notifications-list"
import {
  useNotifications,
  useMarkAllRead,
  type NotificationFilters,
} from "@/hooks/use-notifications"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchInput } from "@/components/portals/shared/search-input"

const PAGE_SIZE = 20

const STATUS_FILTERS = [
  { value: "all", label: "All status" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
] as const

const TYPE_FILTERS = [
  { value: "all", label: "All types" },
  { value: "payment", label: "Payments" },
  { value: "attendance", label: "Attendance" },
  { value: "session", label: "Sessions" },
  { value: "level", label: "Levels" },
  { value: "appointment", label: "Appointments" },
  { value: "announcement", label: "Announcements" },
] as const

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"]
type TypeFilter = (typeof TYPE_FILTERS)[number]["value"]

export default function NotificationsPage() {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [status, setStatus] = useState<StatusFilter>("all")
  const [typeGroup, setTypeGroup] = useState<TypeFilter>("all")
  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput)

  const filters: NotificationFilters = {
    status,
    typeGroup: typeGroup === "all" ? null : typeGroup,
    search: search || null,
  }

  const {
    data: notifications = [],
    isLoading,
    isFetching,
  } = useNotifications(limit, 0, filters)
  const markAllRead = useMarkAllRead()

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const hasMore = notifications.length === limit
  const hasActiveFilter =
    status !== "all" || typeGroup !== "all" || search.length > 0

  function resetFilters() {
    setStatus("all")
    setTypeGroup("all")
    setSearchInput("")
    setLimit(PAGE_SIZE)
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <PageHeader
        title="Notifications"
        description="Updates on your family's sessions, payments, and progress"
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-input px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
            >
              {markAllRead.isPending ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin"
                  strokeWidth={1.75}
                />
              ) : (
                <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={searchInput}
          onChange={(value) => {
            setSearchInput(value)
            setLimit(PAGE_SIZE)
          }}
          placeholder="Search notifications…"
          className="flex-1 sm:max-w-sm"
        />

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as StatusFilter)
            setLimit(PAGE_SIZE)
          }}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={typeGroup}
          onValueChange={(v) => {
            setTypeGroup(v as TypeFilter)
            setLimit(PAGE_SIZE)
          }}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_FILTERS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <>
          <NotificationList notifications={notifications} />

          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                disabled={isFetching}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-input px-4 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
              >
                {isFetching ? (
                  <>
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      strokeWidth={1.75}
                    />
                    Loading…
                  </>
                ) : (
                  "Load more"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
