"use client"

import { useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
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
import { useCoaches } from "@/hooks/admin/use-coaches"
import { uploadTeamImage } from "@/hooks/admin/marketing/upload-team-image"
import {
  useUpsertTeamMember,
  type TeamMember,
} from "@/hooks/admin/marketing/use-team-members"
import { TEAM_VISIBILITIES } from "@/lib/validations/marketing/team-member"

const inputClass =
  "h-11 rounded-lg border border-border bg-input px-3.5 text-sm text-foreground shadow-none focus-visible:ring-0"

export function TeamMemberPanel({
  open,
  onOpenChange,
  member,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TeamMember | null
}) {
  if (!open) return null

  return (
    <TeamMemberPanelForm
      key={member?.id ?? "new"}
      open={open}
      onOpenChange={onOpenChange}
      member={member}
    />
  )
}

function TeamMemberPanelForm({
  open,
  onOpenChange,
  member,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TeamMember | null
}) {
  const { data: coaches } = useCoaches({})
  const upsert = useUpsertTeamMember()

  const initialValues = member
    ? {
        displayName: member.display_name,
        roleTitle: member.role_title,
        bio: member.bio ?? "",
        portraitUrl: member.portrait_url ?? "",
        coachId: member.coach_id?.toString() ?? "",
        sortOrder: member.sort_order.toString(),
        visibility: member.visibility,
      }
    : {
        displayName: "",
        roleTitle: "",
        bio: "",
        portraitUrl: "",
        coachId: "",
        sortOrder: "0",
        visibility: "draft",
      }

  const [displayName, setDisplayName] = useState(initialValues.displayName)
  const [roleTitle, setRoleTitle] = useState(initialValues.roleTitle)
  const [bio, setBio] = useState(initialValues.bio)
  const [portraitUrl, setPortraitUrl] = useState(initialValues.portraitUrl)
  const [coachId, setCoachId] = useState(initialValues.coachId)
  const [sortOrder, setSortOrder] = useState(initialValues.sortOrder)
  const [visibility, setVisibility] = useState(initialValues.visibility)

  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const publicUrl = await uploadTeamImage(file)
      setPortraitUrl(publicUrl)
    } catch (err) {
      toast.add({
        title: "Failed to upload portrait",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSave() {
    setError(null)

    try {
      await upsert.mutateAsync({
        id: member?.id,
        input: {
          displayName,
          roleTitle,
          bio,
          portraitUrl: portraitUrl || null,
          coachId: coachId ? Number(coachId) : null,
          sortOrder: Number(sortOrder) || 0,
          visibility: visibility as never,
        },
      })

      toast.add({
        title: member ? "Team member updated" : "Team member added",
        type: "success",
        timeout: 4000,
      })
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong"
      setError(message)
      toast.add({
        title: "Failed to save team member",
        description: message,
        type: "error",
        timeout: 5000,
      })
    }
  }

  const linkedCoach = (coaches ?? []).find((c) => c.id.toString() === coachId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full gap-0 overflow-hidden rounded-2xl bg-card p-6 shadow-2xl ring-0 sm:max-w-xl">
        <DialogHeader className="p-0 pb-6 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {member ? "Edit team member" : "New team member"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          {/* Portrait Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">
              Portrait image
            </label>
            <div className="flex items-center gap-4">
              {portraitUrl ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portraitUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPortraitUrl("")}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-input text-muted-foreground">
                  <ImagePlus className="h-5 w-5 opacity-50" />
                </div>
              )}

              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="cursor-pointer border-0 bg-transparent shadow-none file:bg-transparent file:text-foreground"
                />
                {isUploading && (
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">
              Display name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Sarah Mokoena"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">
              Role / title
            </label>
            <Input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Head Coach"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">
              Bio (optional)
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio shown on the About page"
              rows={3}
              className="resize-none rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">
              Linked coach (optional)
            </label>
            <Select value={coachId} onValueChange={(v) => setCoachId(v ?? "")}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Not linked" />
              </SelectTrigger>
              <SelectContent>
                {(coaches ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {linkedCoach && (
              <p className="text-[11px] text-muted-foreground">
                This profile is linked to coach{" "}
                <strong>{linkedCoach.fullName}</strong>.
              </p>
            )}
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
                  {TEAM_VISIBILITIES.map((v) => (
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
            disabled={upsert.isPending || isUploading}
            className="text-xs"
          >
            {upsert.isPending
              ? "Saving..."
              : member
                ? "Save changes"
                : "Add member"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
