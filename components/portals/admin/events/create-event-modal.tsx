"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Trophy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { useCreateEvent } from "@/hooks/admin/events/use-event-mutations"
import { useVenues } from "@/hooks/admin/venues/use-venues"
import { toast } from "@/components/ui/toast"

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

export function CreateEventModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState("")
  const [type, setType] = useState("tournament")
  const [status, setStatus] = useState("active")
  const [venueId, setVenueId] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [entryFee, setEntryFee] = useState("0")
  const [capacity, setCapacity] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const { data: venues, isLoading: venuesLoading } = useVenues()

  const resetForm = () => {
    setName("")
    setType("tournament")
    setStatus("active")
    setVenueId("")
    setDate(undefined)
    setEntryFee("0")
    setCapacity("")
    setDescription("")
    setImageUrl(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  const createEvent = useCreateEvent()
  const canSave = name.trim().length > 0 && venueId && date

  async function handleSave() {
    if (!canSave || !date) return

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
      await createEvent.mutateAsync(payload)
      toast.add({
        title: "Event created",
        type: "success",
        timeout: 4000,
      })
      onOpenChange(false)
    } catch (err) {
      toast.add({
        title: "Failed to create event",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <Dialog
      key={open ? "create-event-open" : "create-event-closed"}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-xl [&>button]:top-6 [&>button]:right-6 [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
        <DialogHeader className="flex flex-row items-center gap-3.5 space-y-0 p-0 pb-6 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
            <Trophy
              className="h-4.5 w-4.5 text-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground">
              New event
            </DialogTitle>
            <span className="truncate text-xs text-muted-foreground">
              Tournaments, clinics, and community events
            </span>
          </div>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Header image
            </label>
            <EventImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Event name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly Fun Tournament"
              className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-normal text-muted-foreground">
                Type
              </label>
              <Select
                value={type}
                onValueChange={(value) => setType(value ?? "")}
              >
                <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
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
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-normal text-muted-foreground">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value ?? "")}
              >
                <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
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
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Venue
            </label>
            <Select
              value={venueId}
              onValueChange={(value) => setVenueId(value ?? "")}
            >
              <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
                <SelectValue
                  placeholder={
                    venuesLoading ? "Loading venues..." : "Select a venue"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(venues ?? []).map((v) => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 items-center gap-2 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none"
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-normal text-muted-foreground">
                Entry fee (R)
              </label>
              <Input
                type="number"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-normal text-muted-foreground">
                Capacity (optional)
              </label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="No limit"
                className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this event about?"
              className="min-h-24 resize-none rounded-lg border border-border bg-input p-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <DialogFooter className="mt-8 flex flex-row items-center justify-between gap-3 p-0 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={!canSave || createEvent.isPending}
            onClick={handleSave}
          >
            {createEvent.isPending ? "Creating..." : "Create event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
