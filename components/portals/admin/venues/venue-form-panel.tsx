"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import {
  useCreateVenue,
  useUpdateVenue,
} from "@/hooks/admin/venues/use-venue-mutations"
import type { AdminVenue } from "@/hooks/admin/venues/use-venues"

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
  venue: AdminVenue | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState(venue?.name ?? "")
  const [type, setType] = useState(venue?.type ?? "")
  const [location, setLocation] = useState<LocationValue>({
    address: venue?.address ?? "",
    latitude: venue?.latitude ?? null,
    longitude: venue?.longitude ?? null,
  })

  const isEditing = venue !== null
  const canSave = name.trim().length > 0 && type && location.address

  const createVenue = useCreateVenue()
  const updateVenue = useUpdateVenue()
  const isSaving = createVenue.isPending || updateVenue.isPending

  async function handleSave() {
    if (!canSave) return

    try {
      if (isEditing) {
        await updateVenue.mutateAsync({
          venueId: venue.id,
          name,
          type,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
        })
      } else {
        await createVenue.mutateAsync({
          name,
          type,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
        })
      }

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
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-xl [&>button]:top-6 [&>button]:right-6 [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
        <DialogHeader className="flex flex-row items-center gap-3.5 space-y-0 p-0 pb-6 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-input">
            <MapPin
              className="h-4.5 w-4.5 text-foreground"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <DialogTitle className="truncate text-xl font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit venue" : "New venue"}
            </DialogTitle>
            <span className="truncate text-xs text-muted-foreground">
              {isEditing ? venue.name : "Add a new venue location"}
            </span>
          </div>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Venue name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Soweto Country Club"
              className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Venue type
            </label>
            <Select
              value={type}
              onValueChange={(value) => setType(value ?? "")}
            >
              <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
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
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-normal text-muted-foreground">
              Location
            </label>
            <AddressMapPicker value={location} onChange={setLocation} />
          </div>
        </div>

        <DialogFooter className="mt-8 flex flex-row items-center justify-between gap-3 p-0 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={!canSave || isSaving}
            onClick={handleSave}
          >
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create venue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
