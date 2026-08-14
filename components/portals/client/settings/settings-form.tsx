"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { createClient } from "@/utils/supabase/client"
import { saveAccountSettings } from "@/lib/functions/save-account-settings"

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
    <div className="flex flex-col gap-1.5 border-b border-border/60 py-4 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {hint && (
        <span className="pt-0.5 text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  )
}

const fieldStyles =
  "border-none bg-muted/80 pl-2 shadow-none text-[15px] text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50"

const NOTIFICATION_TYPES: { key: string; label: string }[] = [
  { key: "session_reminder", label: "Session reminders" },
  { key: "gear_due", label: "Gear due" },
  { key: "payment_due", label: "Payment due" },
  { key: "level_upgrade", label: "Level upgrades" },
  {
    key: "parent_consultation_reminder",
    label: "Parent consultation reminders",
  },
  { key: "announcement", label: "Announcements" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export type AccountSettings = {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  avatarUrl: string | null
  preferences: Record<string, boolean>
}

export function SettingsForm({ account }: { account: AccountSettings }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(account.fullName)
  const [phone, setPhone] = useState(account.phone)
  const [address, setAddress] = useState(account.address)
  const [avatarUrl, setAvatarUrl] = useState(account.avatarUrl)
  const [prefs, setPrefs] = useState(account.preferences)
  const [changedPrefKeys, setChangedPrefKeys] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  function togglePref(key: string) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    setChangedPrefKeys((prev) => new Set(prev).add(key))
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    const toastId = "avatar-upload-status"

    toast.add({
      id: toastId,
      title: "Uploading photo...",
      type: "loading",
      timeout: 0,
    })

    try {
      const supabase = createClient()
      const extension = file.name.split(".").pop()
      const filePath = `${account.id}/avatar.${extension}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      // Cache-bust so the new image shows immediately, since the path
      // itself doesn't change on re-upload (upsert overwrites the same file)
      const bustedUrl = `${publicUrl}?t=${Date.now()}`

      const { error: rpcError } = await supabase.rpc("set_my_avatar", {
        p_avatar_url: bustedUrl,
      })
      if (rpcError) throw rpcError

      setAvatarUrl(bustedUrl)

      toast.add({
        id: toastId,
        title: "Photo updated",
        type: "success",
        timeout: 4000,
      })
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong"

      toast.add({
        id: toastId,
        title: "Upload failed",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleSave() {
    setIsSaving(true)
    const toastId = "settings-save-status"

    toast.add({
      id: toastId,
      title: "Saving changes...",
      description: "Please wait",
      type: "loading",
      timeout: 0,
    })

    try {
      const changedPrefs = Object.fromEntries(
        Array.from(changedPrefKeys).map((key) => [key, prefs[key]])
      )

      await saveAccountSettings({ fullName, phone, address, changedPrefs })

      toast.add({
        id: toastId,
        title: "Settings saved",
        type: "success",
        timeout: 4000,
      })

      setChangedPrefKeys(new Set())
      setSavedAt(Date.now())
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong"

      toast.add({
        id: toastId,
        title: "Save failed",
        description: message,
        type: "error",
        timeout: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Tabs defaultValue="profile" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          {/* Left column — avatar */}
          <div className="flex flex-col items-center gap-3 p-6 lg:items-start">
            <Avatar className="h-48 w-48 rounded-full">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
              <AvatarFallback className="bg-pink text-2xl font-medium text-primary-foreground">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <Button
              size="sm"
              variant="secondary"
              className="rounded-md text-xs"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingAvatar ? "Uploading…" : "Change photo"}
            </Button>

            <p className="text-center text-xs text-muted-foreground italic lg:text-left">
              JPG, PNG, or WEBP. 2MB max.
            </p>
          </div>

          {/* Right column — editable details */}
          <section className="rounded-xl bg-secondary p-4 shadow">
            <h2 className="pb-1 text-sm font-medium text-foreground">
              Profile
            </h2>
            <div className="flex flex-col">
              <Field label="Full name">
                <Input
                  className={fieldStyles}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>
              <Field
                label="Email"
                hint="Contact TYGA to change your login email"
              >
                <span className="text-[15px] text-muted-foreground">
                  {account.email}
                </span>
              </Field>
              <Field label="Phone">
                <Input
                  className={fieldStyles}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field label="Address">
                <Input
                  className={fieldStyles}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Field>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              {savedAt && !isSaving && (
                <span className="text-xs text-muted-foreground">Saved</span>
              )}
              <Button
                size="sm"
                className="rounded-md px-5 text-sm"
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </section>
        </div>
      </TabsContent>

      <TabsContent value="notifications" className="mt-0">
        <section className="rounded-xl bg-secondary p-4 shadow">
          <h2 className="pb-1 text-sm font-medium text-foreground">
            Notifications
          </h2>
          <div className="flex flex-col">
            {NOTIFICATION_TYPES.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between border-b border-border/60 py-2.5 last:border-b-0"
              >
                <span className="text-[15px] text-foreground">{label}</span>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={() => togglePref(key)}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            {savedAt && !isSaving && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            <Button
              size="sm"
              className="rounded-md px-5 text-sm"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </section>
      </TabsContent>
    </Tabs>
  )
}
