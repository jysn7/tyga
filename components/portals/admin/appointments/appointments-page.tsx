"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { AppointmentsList } from "@/components/portals/admin/appointments/appointments-list"
import { CreateSlotDialog } from "@/components/portals/admin/appointments/create-slot-dialog"
import { useAdminSchedule } from "@/hooks/shared/use-schedule"

type StatusFilter =
  "all" | "requested" | "scheduled" | "completed" | "cancelled" | "no_show"

export function AppointmentsPage() {
  const [status, setStatus] = useState<StatusFilter>("all")
  const [createOpen, setCreateOpen] = useState(false)

  // Fetch a wide window. The list itself filters by status client-side.
  const { from, to } = (() => {
    const now = new Date()
    const start = new Date(now)
    start.setMonth(start.getMonth() - 3)
    const end = new Date(now)
    end.setMonth(end.getMonth() + 6)
    return { from: start.toISOString(), to: end.toISOString() }
  })()

  const { data, isLoading, error } = useAdminSchedule(from, to)

  const appointments = (data ?? []).filter((e) => e.kind === "appointment")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={status}
          onValueChange={(v) => setStatus((v ?? "all") as StatusFilter)}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No show</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => setCreateOpen(true)}
          className="h-9 shrink-0 text-xs"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Open a slot
        </Button>
      </div>

      <AppointmentsList
        appointments={appointments}
        statusFilter={status}
        isLoading={isLoading}
        error={error}
      />

      <CreateSlotDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
