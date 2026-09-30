"use client"

import { useState } from "react"
import { CalendarDays, Clock } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { Loader } from "@/components/portals/shared/loader"
import { EmptyState } from "@/components/portals/shared/empty-state"
import {
  useHeadCoachAppointments,
  useConfirmAppointment,
  useCompleteAppointment,
  useMarkNoShow,
  type HeadCoachAppointment,
} from "@/hooks/coach/use-head-coach-appointments"
import { QueueCard } from "./queue-card"
import { ConfirmDialog } from "./confirm-dialog"
import { CompleteDialog } from "./complete-dialog"

export function QueueList({ status }: { status: "requested" | "scheduled" }) {
  const { data, isLoading, error } = useHeadCoachAppointments(status)
  const confirm = useConfirmAppointment()
  const complete = useCompleteAppointment()
  const noShow = useMarkNoShow()

  const [confirming, setConfirming] = useState<HeadCoachAppointment | null>(
    null
  )
  const [completing, setCompleting] = useState<HeadCoachAppointment | null>(
    null
  )

  function handleNoShow(appt: HeadCoachAppointment) {
    noShow.mutate(appt.id, {
      onSuccess: () =>
        toast.add({
          title: "Marked as no-show",
          type: "success",
          timeout: 3000,
        }),
      onError: (err) =>
        toast.add({
          title: "Failed to update",
          description:
            err instanceof Error ? err.message : "Something went wrong",
          type: "error",
          timeout: 5000,
        }),
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-card shadow">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error.message}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={status === "requested" ? Clock : CalendarDays}
        title={
          status === "requested"
            ? "No pending requests"
            : "No scheduled appointments"
        }
        description={
          status === "requested"
            ? "When parents book, their requests appear here."
            : "Confirmed appointments will show here."
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((appt) => (
        <QueueCard
          key={appt.id}
          appt={appt}
          onConfirm={() => setConfirming(appt)}
          onComplete={() => setCompleting(appt)}
          onNoShow={() => handleNoShow(appt)}
          isPending={noShow.isPending}
        />
      ))}

      {confirming && (
        <ConfirmDialog
          appt={confirming}
          open={true}
          onOpenChange={(open) => !open && setConfirming(null)}
          onConfirm={(scheduledAt, notes) => {
            confirm.mutate(
              { appointmentId: confirming.id, scheduledAt, notes },
              {
                onSuccess: () => {
                  toast.add({
                    title: "Appointment confirmed",
                    type: "success",
                    timeout: 3000,
                  })
                  setConfirming(null)
                },
                onError: (err) =>
                  toast.add({
                    title: "Failed to confirm",
                    description:
                      err instanceof Error
                        ? err.message
                        : "Something went wrong",
                    type: "error",
                    timeout: 5000,
                  }),
              }
            )
          }}
          isPending={confirm.isPending}
        />
      )}

      {completing && (
        <CompleteDialog
          appt={completing}
          open={true}
          onOpenChange={(open) => !open && setCompleting(null)}
          onComplete={(assessedLevelId, notes) => {
            complete.mutate(
              { appointmentId: completing.id, assessedLevelId, notes },
              {
                onSuccess: () => {
                  toast.add({
                    title: "Appointment completed",
                    type: "success",
                    timeout: 3000,
                  })
                  setCompleting(null)
                },
                onError: (err) =>
                  toast.add({
                    title: "Failed to complete",
                    description:
                      err instanceof Error
                        ? err.message
                        : "Something went wrong",
                    type: "error",
                    timeout: 5000,
                  }),
              }
            )
          }}
          isPending={complete.isPending}
        />
      )}
    </div>
  )
}
