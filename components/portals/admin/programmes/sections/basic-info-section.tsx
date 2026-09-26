"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, X } from "lucide-react"
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
import { createClient } from "@/utils/supabase/client"
import type { Level } from "@/hooks/admin/levels/use-levels"
import type { Venue } from "@/hooks/admin/programmes/use-venues"
import type { ProgrammeType } from "@/hooks/admin/programmes/use-programmes"

const TYPE_OPTIONS: { label: string; value: ProgrammeType }[] = [
  { label: "Development", value: "development" },
  { label: "Community", value: "weekly_community" },
  { label: "Holiday Camp", value: "holiday_camp" },
  { label: "Clinic", value: "clinic" },
  { label: "Corporate", value: "corporate" },
  { label: "League", value: "league" },
]

const GENDER_OPTIONS = [
  { label: "Any", value: "any" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
] as const

export function BasicInfoSection({
  name,
  setName,
  type,
  setType,
  levelId,
  setLevelId,
  venueId,
  setVenueId,
  minAge,
  setMinAge,
  maxAge,
  setMaxAge,
  genderRestriction,
  setGenderRestriction,
  description,
  setDescription,
  imageUrl,
  setImageUrl,
  recurrenceRule,
  setRecurrenceRule,
  termStart,
  setTermStart,
  termEnd,
  setTermEnd,
  price,
  setPrice,
  capacity,
  setCapacity,
  maxRatio,
  setMaxRatio,
  levels,
  venues,
  isSaving,
  onSave,
}: {
  name: string
  setName: (v: string) => void
  type: string
  setType: (v: string) => void
  levelId: string
  setLevelId: (v: string) => void
  venueId: string
  setVenueId: (v: string) => void
  minAge: string
  setMinAge: (v: string) => void
  maxAge: string
  setMaxAge: (v: string) => void
  genderRestriction: string
  setGenderRestriction: (v: string) => void
  description: string
  setDescription: (v: string) => void
  imageUrl: string | null
  setImageUrl: (v: string | null) => void
  recurrenceRule: string
  setRecurrenceRule: (v: string) => void
  termStart: string
  setTermStart: (v: string) => void
  termEnd: string
  setTermEnd: (v: string) => void
  price: string
  setPrice: (v: string) => void
  capacity: string
  setCapacity: (v: string) => void
  maxRatio: string
  setMaxRatio: (v: string) => void
  levels: Level[]
  venues: Venue[]
  isSaving: boolean
  onSave: (data: {
    name: string
    type: string
    levelId: string
    venueId: string
    minAge: string
    maxAge: string
    genderRestriction: string
    description: string
    imageUrl: string | null
    recurrenceRule: string
    termStart: string
    termEnd: string
    price: string
    capacity: string
    maxRatio: string
  }) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pending local file — not uploaded until Save is clicked
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  // Blob URL for local preview (revoked when file changes/unmounts)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  // Whether the user explicitly removed the existing DB image
  const [removeExisting, setRemoveExisting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const canSave = name && type && venueId && minAge && maxAge

  // What to display: blob preview if a new file is picked, else existing DB url (unless removed)
  const displayUrl = previewUrl ?? (!removeExisting ? imageUrl : null)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Revoke previous blob URL if any
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setRemoveExisting(false)

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleRemoveImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPendingFile(null)
    setPreviewUrl(null)
    setRemoveExisting(true)
  }

  async function uploadPendingFile(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage
      .from("programme-images")
      .upload(path, file, { upsert: false, cacheControl: "3600" })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage
      .from("programme-images")
      .getPublicUrl(path)

    return data.publicUrl
  }

  const handleSave = async () => {
    try {
      let resolvedImageUrl: string | null

      if (pendingFile) {
        // Upload now, on Save
        setIsUploading(true)
        resolvedImageUrl = await uploadPendingFile(pendingFile)
        setImageUrl(resolvedImageUrl)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPendingFile(null)
        setPreviewUrl(null)
      } else if (removeExisting) {
        resolvedImageUrl = null
        setImageUrl(null)
      } else {
        resolvedImageUrl = imageUrl
      }

      setRemoveExisting(false)
      setIsUploading(false)

      onSave({
        name,
        type,
        levelId,
        venueId,
        minAge,
        maxAge,
        genderRestriction,
        description,
        imageUrl: resolvedImageUrl,
        recurrenceRule,
        termStart,
        termEnd,
        price,
        capacity,
        maxRatio,
      })
    } catch (err) {
      setIsUploading(false)
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      toast.add({
        title: "Failed to upload image",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-foreground">Basic Information</h3>

      {/* Cover image */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-normal text-muted-foreground">
          Cover image
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-input">
            {displayUrl ? (
              <Image
                src={displayUrl}
                alt="Programme cover"
                fill
                sizes="64px"
                className="object-cover"
                unoptimized={displayUrl.startsWith("blob:")}
              />
            ) : (
              <ImagePlus
                className="h-5 w-5 text-muted-foreground"
                strokeWidth={1.75}
              />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs"
              >
                <ImagePlus className="mr-1 h-3.5 w-3.5" />
                {displayUrl ? "Replace" : "Upload image"}
              </Button>
              {displayUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Remove
                </Button>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {pendingFile
                ? "Will upload when you save"
                : "JPG, PNG, or WebP · up to 5 MB"}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-normal text-muted-foreground">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this programme about?"
          rows={3}
          className="resize-none rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Programme name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Saturday Junior Clinic"
            className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Type
          </label>
          <Select value={type} onValueChange={(value) => setType(value ?? "")}>
            <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Level
          </label>
          <Select
            value={levelId}
            onValueChange={(value) => setLevelId(value ?? "")}
          >
            <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
              <SelectValue placeholder="Select a level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((l) => (
                <SelectItem key={l.id} value={l.id.toString()}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <SelectValue placeholder="Select a venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((v) => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Age range
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              placeholder="Min"
              className="h-11 flex-1 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              placeholder="Max"
              className="h-11 flex-1 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Gender restriction
          </label>
          <Select
            value={genderRestriction}
            onValueChange={(value) => setGenderRestriction(value ?? "any")}
          >
            <SelectTrigger className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Recurrence
          </label>
          <Input
            value={recurrenceRule}
            onChange={(e) => setRecurrenceRule(e.target.value)}
            placeholder="e.g. Mon, Wed 4pm–5pm"
            className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Term start
          </label>
          <Input
            type="date"
            value={termStart}
            onChange={(e) => setTermStart(e.target.value)}
            className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Term end
          </label>
          <Input
            type="date"
            value={termEnd}
            onChange={(e) => setTermEnd(e.target.value)}
            className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Price (per term)
          </label>
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 1200"
            className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Capacity
          </label>
          <Input
            type="number"
            min={0}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 12"
            className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-muted-foreground">
            Max coach ratio (optional)
          </label>
          <Input
            type="number"
            min={1}
            value={maxRatio}
            onChange={(e) => setMaxRatio(e.target.value)}
            placeholder="e.g. 8"
            className="h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button
          onClick={handleSave}
          disabled={!canSave || isSaving || isUploading}
          className="h-11 px-6 text-sm"
        >
          {isSaving || isUploading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  )
}
