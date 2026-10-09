"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useVenues } from "@/hooks/admin/programmes/use-venues"
import {
  useUpsertMarketingEvent,
  type MarketingEvent,
} from "@/hooks/admin/marketing/use-marketing-events"
import {
  EVENT_TYPES,
  EVENT_VISIBILITIES,
} from "@/lib/validations/marketing/event"

const inputClass =
  "h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"

export function MarketingEventPanel({
  open,
  onOpenChange,
  event,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: MarketingEvent | null
}) {
  if (!open) return null

  return (
    <MarketingEventPanelForm
      key={event?.id ?? "new"}
      open={open}
      onOpenChange={onOpenChange}
      event={event}
    />
  )
}

function MarketingEventPanelForm({
  open,
  onOpenChange,
  event,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: MarketingEvent | null
}) {
  const { data: venues } = useVenues()
  const upsert = useUpsertMarketingEvent()

  const initialValues = event
    ? {
        name: event.name,
        type: event.type ?? "",
        venueId: event.venue_id?.toString() ?? "",
        eventDate: event.event_date ?? "",
        startTime: event.start_time?.slice(0, 5) ?? "",
        description: event.description ?? "",
        entryFee: event.entry_fee?.toString() ?? "",
        capacity: event.capacity?.toString() ?? "",
        sortOrder: event.sort_order.toString(),
        visibility: event.visibility,
      }
    : {
        name: "",
        type: "",
        venueId: "",
        eventDate: "",
        startTime: "",
        description: "",
        entryFee: "",
        capacity: "",
        sortOrder: "0",
        visibility: "draft",
      }

  const [name, setName] = useState(initialValues.name)
  const [type, setType] = useState<string>(initialValues.type)
  const [venueId, setVenueId] = useState(initialValues.venueId)
  const [eventDate, setEventDate] = useState(initialValues.eventDate)
  const [startTime, setStartTime] = useState(initialValues.startTime)
  const [description, setDescription] = useState(initialValues.description)
  const [entryFee, setEntryFee] = useState(initialValues.entryFee)
  const [capacity, setCapacity] = useState(initialValues.capacity)
  const [sortOrder, setSortOrder] = useState(initialValues.sortOrder)
  const [visibility, setVisibility] = useState<string>(initialValues.visibility)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)

    try {
      await upsert.mutateAsync({
        id: event?.id,
        input: {
          name,
          type: type as never,
          venueId: Number(venueId) || 0,
          eventDate,
          startTime,
          description,
          imageUrl: event?.image_url ?? null,
          entryFee: entryFee === "" ? undefined : Number(entryFee),
          capacity: capacity === "" ? undefined : Number(capacity),
          sortOrder: Number(sortOrder) || 0,
          visibility: visibility as never,
        },
      })

      toast.add({
        title: event ? "Event updated" : "Event created",
        type: "success",
        timeout: 4000,
      })
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      setError(message)
      toast.add({
        title: "Failed to save event",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-xl">
        <DialogHeader className="p-0 pb-6 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {event ? "Edit event" : "New event"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Junior Spring Cup"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Type</label>
              <Select value={type} onValueChange={(v) => setType(v ?? "")}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Venue</label>
              <Select
                value={venueId}
                onValueChange={(v) => setVenueId(v ?? "")}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select venue" />
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Date</label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                Start time
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Entry fee</label>
              <Input
                type="number"
                min={0}
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Capacity</label>
              <Input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                Sort order
              </label>
              <Input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                Visibility
              </label>
              <Select
                value={visibility}
                onValueChange={(v) => setVisibility(v ?? "draft")}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_VISIBILITIES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={upsert.isPending}
            className="text-xs"
          >
            {upsert.isPending ? "Saving..." : event ? "Save changes" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
