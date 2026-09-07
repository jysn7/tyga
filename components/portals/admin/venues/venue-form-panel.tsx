"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import { SidePanel } from "@/components/portals/shared/side-sheet"
import { Field } from "@/components/portals/shared/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AddressMapPicker,
  type LocationValue,
} from "@/components/portals/shared/address-map-picker"
import { toast } from "@/components/ui/toast"
import type { Venue } from "@/lib/types"

const VENUE_TYPES = [
  { label: "Course", value: "course" },
  { label: "Practice ground", value: "practice_ground" },
  { label: "Driving range", value: "range" },
  { label: "School facility", value: "school" },
] as const

export function VenueFormPanel({
  venue,
  open,
  onOpenChange,
}: {
  venue: Venue | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState(venue?.name ?? "")
  const [type, setType] = useState(venue?.type ?? "")
  const [location, setLocation] = useState<LocationValue>({
    address: venue?.address ?? "",
    latitude: null,
    longitude: null,
  })
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = venue !== null
  const canSave = name.trim().length > 0 && type && location.address

  async function handleSave() {
    if (!canSave) return
    setIsSaving(true)

    try {
      // TODO: call admin_create_venue or admin_update_venue via Supabase RPC
      await new Promise((r) => setTimeout(r, 500))

      toast.add({
        title: isEditing ? "Venue updated" : "Venue created",
        description: `${name} has been ${isEditing ? "updated" : "added"} successfully.`,
        type: "success",
        timeout: 4000,
      })

      onOpenChange(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: isEditing ? "Failed to update venue" : "Failed to create venue",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SidePanel
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit venue" : "New venue"}
      description={isEditing ? venue.name : "Add a new venue location"}
      header={
        <div className="flex items-center gap-4 border-b border-border/60 px-8 pt-8 pb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent">
            <MapPin className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit venue" : "New venue"}
            </span>
            <span className="text-sm text-muted-foreground">
              {isEditing ? venue.name : "Add a new venue location"}
            </span>
          </div>
        </div>
      }
      footer={
        <Button
          className="w-full rounded-lg text-sm"
          disabled={!canSave || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create venue"}
        </Button>
      }
    >
      <div className="flex flex-col">
        <Field label="Venue name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Soweto Country Club"
          />
        </Field>

        <Field label="Venue type">
          <Select value={type} onValueChange={(value) => setType(value ?? "")}>
            <SelectTrigger className="h-auto w-full border-none bg-transparent text-[15px] font-normal shadow-none focus:ring-0">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {VENUE_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Location field WITHOUT Field wrapper */}
        <div className="flex flex-col gap-1.5 border-b border-border/60 py-3 last:border-b-0">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Location
          </span>
          <AddressMapPicker value={location} onChange={setLocation} />
        </div>
      </div>
    </SidePanel>
  )
}
