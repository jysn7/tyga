"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarCheck, CalendarIcon, MapPin } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Button } from "@/components/ui/button"
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

type Venue = { id: string; name: string }

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border/60 py-3 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}

const triggerStyles =
  "h-auto w-full justify-start border-none bg-transparent p-0 text-[15px] font-normal text-foreground shadow-none hover:bg-transparent"

export function BookAssessmentPanel({
  memberName,
  venues,
  open,
  onOpenChange,
  onSubmit,
}: {
  memberName: string
  venues: Venue[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: {
    venueId: string
    preferredDate: Date
    notes: string
  }) => void
}) {
  const [venueId, setVenueId] = useState("")
  const [preferredDate, setPreferredDate] = useState<Date | undefined>()
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = venueId && preferredDate
  const selectedVenue = venues.find((v) => v.id === venueId)

  async function handleSubmit() {
    if (!venueId || !preferredDate) return
    setIsSubmitting(true)
    await onSubmit?.({ venueId, preferredDate, notes })
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Book an assessment"
      header={
        <div className="flex items-center gap-4 px-8 pt-8 pb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CalendarCheck className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Book an assessment
            </span>
            <span className="text-sm text-muted-foreground">
              For {memberName}
            </span>
          </div>
        </div>
      }
      footer={
        <Button
          className="w-full rounded-md text-sm"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Requesting…" : "Request assessment"}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <Field label="Venue">
            <Select value={venueId} onValueChange={setVenueId}>
              <SelectTrigger className={triggerStyles}>
                <SelectValue placeholder="Select a venue" />
              </SelectTrigger>
              <SelectContent>
                {venues.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Preferred date"
            hint="A coach will confirm the exact time once reviewed."
          >
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 py-0.5 text-[15px] text-foreground">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {preferredDate ? (
                    format(preferredDate, "PPP")
                  ) : (
                    <span className="text-muted-foreground/60">
                      Pick a date
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto border-border/60 p-0 shadow-md"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={preferredDate}
                  onSelect={setPreferredDate}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </Field>

          <Field label="Notes (optional)">
            <Textarea
              className="min-h-20 resize-none border-none bg-transparent p-0 text-[15px] text-foreground shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
              placeholder="Prior experience, availability constraints..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>

        {canSubmit && (
          <div className="flex flex-col gap-2 rounded-lg bg-muted/60 p-3.5">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-foreground">{selectedVenue?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-foreground">
                {format(preferredDate!, "PPP")}
              </span>
            </div>
          </div>
        )}
      </div>
    </SidePanel>
  )
}
