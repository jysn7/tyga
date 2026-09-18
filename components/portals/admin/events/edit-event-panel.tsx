"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Trophy } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Field } from "@/components/portals/shared/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EventImageUpload } from "@/components/portals/admin/events/event-image-upload"
import { useUpdateEvent } from "@/hooks/admin/events/use-event-mutations"
import { useVenues } from "@/hooks/admin/venues/use-venues"
import { toast } from "@/components/ui/toast"
import type { Event } from "@/lib/types"

const EVENT_TYPES = [
  { label: "Tournament", value: "tournament" },
  { label: "Fun tournament", value: "fun_tournament" },
  { label: "Clinic", value: "clinic" },
  { label: "Parent workshop", value: "parent_workshop" },
  { label: "Corporate", value: "corporate" },
] as const

const EVENT_STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
] as const

type EventFormValues = {
  name: string
  type: string
  status: string
  venueId: string
  date: Date | undefined
  entryFee: string
  capacity: string
  description: string
  imageUrl: string | null
}

const getInitialValues = (nextEvent: Event | null): EventFormValues => ({
  name: nextEvent?.name ?? "",
  type: nextEvent?.type ?? "tournament",
  status: nextEvent?.status ?? "active",
  venueId: nextEvent?.venueId?.toString() ?? "",
  date: nextEvent?.eventDate ? new Date(nextEvent.eventDate) : undefined,
  entryFee: nextEvent?.entryFee?.toString() ?? "0",
  capacity: nextEvent?.capacity?.toString() ?? "",
  description: nextEvent?.description ?? "",
  imageUrl: nextEvent?.imageUrl ?? null,
})

export function EditEventPanel({
  event,
  open,
  onOpenChange,
}: {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState(() => getInitialValues(event).name)
  const [type, setType] = useState(() => getInitialValues(event).type)
  const [status, setStatus] = useState(() => getInitialValues(event).status)
  const [venueId, setVenueId] = useState(() => getInitialValues(event).venueId)
  const [date, setDate] = useState<Date | undefined>(
    () => getInitialValues(event).date
  )
  const [entryFee, setEntryFee] = useState(
    () => getInitialValues(event).entryFee
  )
  const [capacity, setCapacity] = useState(
    () => getInitialValues(event).capacity
  )
  const [description, setDescription] = useState(
    () => getInitialValues(event).description
  )
  const [imageUrl, setImageUrl] = useState<string | null>(
    () => getInitialValues(event).imageUrl
  )

  const { data: venues } = useVenues()

  const resetForm = () => {
    const defaults = getInitialValues(null)
    setName(defaults.name)
    setType(defaults.type)
    setStatus(defaults.status)
    setVenueId(defaults.venueId)
    setDate(defaults.date)
    setEntryFee(defaults.entryFee)
    setCapacity(defaults.capacity)
    setDescription(defaults.description)
    setImageUrl(defaults.imageUrl)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  const updateEvent = useUpdateEvent()
  const canSave = name.trim().length > 0 && venueId && date

  async function handleSave() {
    if (!canSave || !date || !event) return

    const payload = {
      name,
      type,
      status,
      venueId: Number(venueId),
      eventDate: format(date, "yyyy-MM-dd"),
      entryFee: Number(entryFee) || 0,
      capacity: capacity ? Number(capacity) : null,
      description: description || null,
      imageUrl,
    }

    try {
      await updateEvent.mutateAsync({ eventId: event.id, ...payload })
      toast.add({
        title: "Event updated",
        type: "success",
        timeout: 4000,
      })
      onOpenChange(false)
    } catch (err) {
      toast.add({
        title: "Failed to update event",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  if (!event) return null

  return (
    <SidePanel
      key={`${event.id}-${open ? "open" : "closed"}`}
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit event"
      header={
        <div className="flex items-center gap-4 border-b border-border/60 px-8 pt-8 pb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-input">
            <Trophy className="h-6 w-6 text-foreground" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Edit event
            </span>
            <span className="text-sm text-muted-foreground">{event.name}</span>
          </div>
        </div>
      }
      footer={
        <Button
          className="w-full text-sm"
          variant="secondary"
          disabled={!canSave || updateEvent.isPending}
          onClick={handleSave}
        >
          {updateEvent.isPending ? "Saving…" : "Save changes"}
        </Button>
      }
    >
      <div className="flex flex-col">
        <Field label="Header image">
          <EventImageUpload value={imageUrl} onChange={setImageUrl} />
        </Field>

        <Field label="Event name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Monthly Fun Tournament"
          />
        </Field>

        <Field label="Type">
          <Select value={type} onValueChange={(value) => setType(value ?? "")}>
            <SelectTrigger className="h-auto w-full text-[15px] font-normal shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Status">
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus((value as Event["status"]) ?? "active")
            }
          >
            <SelectTrigger className="h-auto w-full text-[15px] font-normal shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Venue">
          <Select
            value={venueId}
            onValueChange={(value) => setVenueId(value ?? "")}
          >
            <SelectTrigger className="h-auto w-full text-[15px] font-normal shadow-none focus:ring-0">
              <SelectValue placeholder="Select a venue" />
            </SelectTrigger>
            <SelectContent>
              {(venues ?? []).map((v) => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Date">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 py-0.5 text-[15px] text-foreground"
              >
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                {date ? (
                  format(date, "PPP")
                ) : (
                  <span className="text-muted-foreground">Pick a date</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
        </Field>

        <Field label="Entry fee (R)">
          <Input
            type="number"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
          />
        </Field>

        <Field label="Capacity (optional)">
          <Input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="No limit"
          />
        </Field>

        <Field label="Description (optional)">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this event about?"
            className="min-h-20 resize-none"
          />
        </Field>
      </div>
    </SidePanel>
  )
}
