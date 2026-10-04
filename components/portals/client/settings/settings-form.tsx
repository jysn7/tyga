"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { createClient } from "@/utils/supabase/client"
import { saveAccountSettings } from "@/lib/functions/save-account-settings"
import { Field, fieldStyles } from "@/components/portals/shared/field"
import { PushToggle } from "@/components/portals/shared/push-toggle"
import { Camera, ShieldAlert, Check } from "lucide-react"

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

function validatePhone(raw: string): {
  ok: boolean
  formatted?: string
  e164?: string
  error?: string
} {
  const trimmed = raw.trim()
  if (trimmed === "") {
    return { ok: false, error: "Phone number is required" }
  }

  const parsed = parsePhoneNumberFromString(trimmed, "ZA")

  if (!parsed) {
    return { ok: false, error: "Enter a valid phone number" }
  }

  if (!parsed.isValid()) {
    return { ok: false, error: "That doesn't look like a valid number" }
  }

  return {
    ok: true,
    formatted: parsed.formatNational(),
    e164: parsed.number,
  }
}

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

  const phoneValidation = useMemo(() => validatePhone(phone), [phone])
  const phoneTouched = phone.length > 0

  const fullNameValid = fullName.trim().length >= 2

  const canSave =
    phoneValidation.ok && fullNameValid && !isSaving && !isUploadingAvatar

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const formatted = new AsYouType("ZA").input(raw)
    setPhone(formatted || raw)
  }

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
    if (!phoneValidation.ok) {
      toast.add({
        title: "Check your phone number",
        description: phoneValidation.error,
        type: "error",
        timeout: 4000,
      })
      return
    }

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

      await saveAccountSettings({
        fullName,
        phone: phoneValidation.e164 ?? phone,
        address,
        changedPrefs,
      })

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
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <div className="flex flex-col gap-6">
          {/* Profile photo */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Profile photo
              </h2>
              <p className="text-xs text-muted-foreground">
                This is how you&apos;ll appear across the app
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 rounded-xl bg-card p-5 shadow sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 shrink-0 rounded-full">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                <AvatarFallback className="bg-pink/15 text-base font-semibold text-pink">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-md text-xs"
                    disabled={isUploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
                    {isUploadingAvatar ? "Uploading…" : "Change photo"}
                  </Button>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  JPG, PNG, or WEBP · 2 MB max
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </section>

          {/* Profile details */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Profile details
              </h2>
              <p className="text-xs text-muted-foreground">
                Update your personal information
              </p>
            </div>
            <div className="flex flex-col rounded-xl bg-card p-5 shadow">
              <Field
                label="Full name"
                error={
                  fullName.length > 0 && !fullNameValid
                    ? "Name must be at least 2 characters"
                    : undefined
                }
              >
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

              <Field
                label="Phone"
                hint="Any country — defaults to South Africa if no country code"
                error={
                  phoneTouched && !phoneValidation.ok
                    ? phoneValidation.error
                    : undefined
                }
              >
                <div className="relative">
                  <Input
                    className={fieldStyles}
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="082 123 4567"
                  />
                  {phoneTouched && phoneValidation.ok && (
                    <Check
                      className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-green"
                      strokeWidth={2}
                    />
                  )}
                </div>
              </Field>

              <Field label="Address">
                <Input
                  className={fieldStyles}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* Save bar */}
          <div className="flex items-center justify-end gap-3">
            {savedAt && !isSaving && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            <Button
              size="sm"
              className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
              disabled={!canSave}
              onClick={handleSave}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="notifications" className="mt-0">
        <div className="flex flex-col gap-6">
          {/* Device push toggle */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                This device
              </h2>
              <p className="text-xs text-muted-foreground">
                Get notified on this device when something happens
              </p>
            </div>
            <div className="rounded-xl bg-card p-5 shadow">
              <PushToggle />
            </div>
          </section>

          {/* Per-type preferences */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                What you&apos;re notified about
              </h2>
              <p className="text-xs text-muted-foreground">
                Choose which updates you&apos;d like to receive
              </p>
            </div>
            <div className="flex flex-col rounded-xl bg-card p-5 shadow">
              {NOTIFICATION_TYPES.map(({ key, label }, i) => (
                <div
                  key={key}
                  className={`flex items-center justify-between border-b border-border/60 py-3 last:border-b-0 ${
                    i === 0 ? "pt-0" : ""
                  } ${i === NOTIFICATION_TYPES.length - 1 ? "pb-0" : ""}`}
                >
                  <span className="text-sm text-foreground">{label}</span>
                  <Switch
                    checked={prefs[key]}
                    onCheckedChange={() => togglePref(key)}
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            {savedAt && !isSaving && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            <Button
              size="sm"
              className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="account" className="mt-0">
        <section className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <ShieldAlert
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
              strokeWidth={1.75}
            />
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Deactivate account
              </h2>
              <p className="text-xs text-muted-foreground">
                This will disable your account and sign you out everywhere.
                Contact TYGA to reactivate.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-5 shadow sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                Deactivate my account
              </span>
              <span className="text-xs text-muted-foreground">
                You&apos;ll lose access until TYGA reactivates it.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled
              className="h-9 shrink-0 rounded-md border-destructive/40 text-xs font-medium text-destructive disabled:opacity-60"
              title="Contact TYGA to deactivate your account"
            >
              Deactivate account
            </Button>
          </div>
        </section>
      </TabsContent>
    </Tabs>
  )
}
