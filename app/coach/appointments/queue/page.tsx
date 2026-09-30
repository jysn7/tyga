"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  CalendarDays,
  Clock,
  MapPin,
  Layers,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/portals/shared/loader"
import { toast } from "@/components/ui/toast"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useHeadCoachAppointments,
  useConfirmAppointment,
  useCompleteAppointment,
  useMarkNoShow,
  type HeadCoachAppointment,
} from "@/hooks/coach/use-head-coach-appointments"
import { useLevels } from "@/hooks/admin/levels/use-levels"

const TAB_TRIGGER_CLASS =
  "flex-1 gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-initial sm:gap-2 sm:px-3"

export default function HeadCoachQueuePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Appointment queue
        </h1>
        <p className="text-sm text-muted-foreground">
          Confirm requests and record outcomes.
        </p>
      </div>

      <Tabs defaultValue="requested" className="flex flex-col gap-5">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:w-fit">
          <TabsTrigger value="requested" className={TAB_TRIGGER_CLASS}>
            Requested
          </TabsTrigger>
          <TabsTrigger value="scheduled" className={TAB_TRIGGER_CLASS}>
            Scheduled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requested" className="mt-0">
          <QueueTab status="requested" />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-0">
          <QueueTab status="scheduled" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function QueueTab({ status }: { status: "requested" | "scheduled" }) {
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
      <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-input">
          {status === "requested" ? (
            <Clock
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          ) : (
            <CalendarDays
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {status === "requested"
              ? "No pending requests"
              : "No scheduled appointments"}
          </span>
          <span className="text-xs text-muted-foreground">
            {status === "requested"
              ? "When parents book, their requests appear here."
              : "Confirmed appointments will show here."}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((appt) => (
        <AppointmentCard
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

function AppointmentCard({
  appt,
  onConfirm,
  onComplete,
  onNoShow,
  isPending,
}: {
  appt: HeadCoachAppointment
  onConfirm: () => void
  onComplete: () => void
  onNoShow: () => void
  isPending: boolean
}) {
  const when = appt.scheduledAt ?? appt.slotStartsAt

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {appt.memberName}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
              appt.status === "requested"
                ? "bg-orange-light text-secondary"
                : "bg-green-light text-secondary"
            }`}
          >
            {appt.status === "requested" ? "Requested" : "Scheduled"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {when && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" strokeWidth={1.75} />
              {format(new Date(when), "EEE d MMM, HH:mm")}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" strokeWidth={1.75} />
            {appt.venueName}
          </span>
          {appt.levelName && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" strokeWidth={1.75} />
              {appt.levelName}
            </span>
          )}
          {appt.coachName && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" strokeWidth={1.75} />
              {appt.coachName}
            </span>
          )}
        </div>

        {appt.notes && (
          <p className="text-xs text-muted-foreground">{appt.notes}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {appt.status === "requested" && (
          <Button onClick={onConfirm} size="sm" className="h-8 gap-1 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Confirm
          </Button>
        )}

        {appt.status === "scheduled" && (
          <>
            <Button
              onClick={onComplete}
              size="sm"
              className="h-8 gap-1 text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Complete
            </Button>
            <Button
              onClick={onNoShow}
              disabled={isPending}
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
            >
              <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
              No-show
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// ---------- Confirm dialog ----------

function ConfirmDialog({
  appt,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  appt: HeadCoachAppointment
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (scheduledAt: string, notes?: string) => void
  isPending: boolean
}) {
  // Default to the slot's start, if there is one. Otherwise leave blank
  // and require the head coach to pick a time.
  const defaultDate = appt.slotStartsAt
    ? format(new Date(appt.slotStartsAt), "yyyy-MM-dd")
    : ""
  const defaultTime = appt.slotStartsAt
    ? format(new Date(appt.slotStartsAt), "HH:mm")
    : ""

  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState(defaultTime)
  const [notes, setNotes] = useState(appt.notes ?? "")

  const canSubmit = !!date && !!time

  function handleSubmit() {
    if (!canSubmit) return
    const iso = new Date(`${date}T${time}`).toISOString()
    onConfirm(iso, notes || undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm appointment</DialogTitle>
          <DialogDescription>
            {appt.memberName} · {appt.venueName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Date">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </Field>
            <Field label="Time">
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11"
              />
            </Field>
          </div>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions for the parent…"
              className="min-h-20 resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending ? "Confirming…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Complete dialog ----------

function CompleteDialog({
  appt,
  open,
  onOpenChange,
  onComplete,
  isPending,
}: {
  appt: HeadCoachAppointment
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (assessedLevelId: number | null, notes?: string) => void
  isPending: boolean
}) {
  const { data: levels } = useLevels()
  const [assessedLevelId, setAssessedLevelId] = useState("")
  const [notes, setNotes] = useState(appt.notes ?? "")

  function handleSubmit() {
    onComplete(
      assessedLevelId && assessedLevelId !== "none"
        ? Number(assessedLevelId)
        : null,
      notes || undefined
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete appointment</DialogTitle>
          <DialogDescription>
            {appt.memberName} ·{" "}
            {appt.scheduledAt
              ? format(new Date(appt.scheduledAt), "EEE d MMM, HH:mm")
              : "—"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <Field label="Assessed level">
            <Select
              value={assessedLevelId || "none"}
              onValueChange={(v) =>
                setAssessedLevelId(v === "none" ? "" : (v ?? ""))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Not assessed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not assessed</SelectItem>
                {(levels ?? []).map((l) => (
                  <SelectItem key={l.id} value={l.id.toString()}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the assessment go?"
              className="min-h-24 resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Completing…" : "Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Small helper ----------

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}
