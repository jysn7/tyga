"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AsYouType } from "libphonenumber-js"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { Field, fieldStyles } from "@/components/portals/shared/field"
import { PushToggle } from "@/components/portals/shared/push-toggle"
import { Loader } from "@/components/portals/shared/loader"
import {
  useMySettings,
  useUpdateMySettings,
  useUploadAvatar,
  useChangePassword,
  useRevokeSession,
  useRevokeOtherSessions,
  useExportMyData,
  useRequestDeletion,
  useCancelDeletionRequest,
  describeUserAgent,
  normalisePhone,
  type MySettings,
} from "@/hooks/shared/use-my-settings"
import { NeedsMfaError } from "@/hooks/shared/use-mfa"
import {
  Camera,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Laptop,
  Download,
  Trash2,
  X,
} from "lucide-react"
import Link from "next/link"

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
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

export function NewSettingsForm() {
  const { data: settings, isLoading, error, refetch } = useMySettings()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Couldn't load your settings."}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return <SettingsTabs settings={settings} />
}

function SettingsTabs({ settings }: { settings: MySettings }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateProfile = useUpdateMySettings()
  const uploadAvatar = useUploadAvatar()
  const changePassword = useChangePassword()
  const revokeSession = useRevokeSession()
  const revokeOthers = useRevokeOtherSessions()
  const exportData = useExportMyData()
  const requestDeletion = useRequestDeletion()
  const cancelDeletion = useCancelDeletionRequest()

  const [fullName, setFullName] = useState(settings.fullName)
  const [phone, setPhone] = useState(settings.phone)
  const [address, setAddress] = useState(settings.address)
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [revealPasswords, setRevealPasswords] = useState(false)
  const [needsMfa, setNeedsMfa] = useState(false)

  const [deletionReason, setDeletionReason] = useState("")

  const phoneValidation = normalisePhone(phone)
  const phoneTouched = phone.length > 0
  const fullNameValid = fullName.trim().length >= 2

  const canSaveProfile =
    phoneValidation.ok &&
    fullNameValid &&
    !updateProfile.isPending &&
    !uploadAvatar.isPending

  const newPasswordTooShort = newPassword.length > 0 && newPassword.length < 8
  const sameAsCurrent =
    newPassword.length > 0 && newPassword === currentPassword
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword
  const canChangePassword =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    newPassword !== currentPassword &&
    !changePassword.isPending &&
    !!settings.login.hasPassword

  const openDeletionRequest = settings.requests.find(
    (r) => r.kind === "deletion" && r.status === "open"
  )

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const formatted = new AsYouType("ZA").input(raw)
    setPhone(formatted || raw)
  }

  function togglePref(key: string) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const toastId = "avatar-upload-status"
    toast.add({
      id: toastId,
      title: "Uploading photo...",
      type: "loading",
      timeout: 0,
    })

    try {
      await uploadAvatar.mutateAsync({ file, userId: settings.id })
      toast.add({
        id: toastId,
        title: "Photo updated",
        type: "success",
        timeout: 4000,
      })
      router.refresh()
    } catch (err) {
      toast.add({
        id: toastId,
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleSaveProfile() {
    if (!phoneValidation.ok) {
      toast.add({
        title: "Check your phone number",
        description: phoneValidation.error,
        type: "error",
        timeout: 4000,
      })
      return
    }

    const toastId = "settings-save-status"
    toast.add({
      id: toastId,
      title: "Saving changes...",
      description: "Please wait",
      type: "loading",
      timeout: 0,
    })

    try {
      await updateProfile.mutateAsync({
        fullName,
        phone,
        address,
      })
      toast.add({
        id: toastId,
        title: "Settings saved",
        type: "success",
        timeout: 4000,
      })
      setSavedAt(Date.now())
      router.refresh()
    } catch (err) {
      toast.add({
        id: toastId,
        title: "Save failed",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleChangePassword() {
    const toastId = "password-change-status"
    toast.add({
      id: toastId,
      title: "Updating password...",
      type: "loading",
      timeout: 0,
    })

    try {
      await changePassword.mutateAsync({
        email: settings.email,
        currentPassword,
        newPassword,
      })
      toast.add({
        id: toastId,
        title: "Password changed",
        description: "Other devices have been signed out.",
        type: "success",
        timeout: 4000,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setNeedsMfa(false)
      router.refresh()
    } catch (err) {
      if (err instanceof NeedsMfaError) {
        setNeedsMfa(true)
        toast.add({
          id: toastId,
          title: "Verification required",
          description:
            "Enter a code from your authenticator app to change your password.",
          type: "error",
          timeout: 6000,
        })
        return
      }
      toast.add({
        id: toastId,
        title: "Couldn't change password",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleRevokeSession(sessionId: string) {
    const toastId = `revoke-${sessionId}`
    toast.add({
      id: toastId,
      title: "Signing out device...",
      type: "loading",
      timeout: 0,
    })
    try {
      await revokeSession.mutateAsync(sessionId)
      toast.add({
        id: toastId,
        title: "Device signed out",
        type: "success",
        timeout: 4000,
      })
    } catch (err) {
      toast.add({
        id: toastId,
        title: "Couldn't sign out device",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleRevokeOthers() {
    const toastId = "revoke-others"
    toast.add({
      id: toastId,
      title: "Signing out other devices...",
      type: "loading",
      timeout: 0,
    })
    try {
      const count = await revokeOthers.mutateAsync()
      toast.add({
        id: toastId,
        title: count > 0 ? `Signed out ${count} device(s)` : "No other devices",
        type: "success",
        timeout: 4000,
      })
    } catch (err) {
      toast.add({
        id: toastId,
        title: "Couldn't sign out devices",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleExport() {
    const toastId = "export-status"
    toast.add({
      id: toastId,
      title: "Preparing your data...",
      type: "loading",
      timeout: 0,
    })
    try {
      await exportData.mutateAsync()
      toast.add({
        id: toastId,
        title: "Download ready",
        type: "success",
        timeout: 4000,
      })
    } catch (err) {
      toast.add({
        id: toastId,
        title: "Export failed",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleRequestDeletion() {
    const toastId = "deletion-request"
    toast.add({
      id: toastId,
      title: "Submitting request...",
      type: "loading",
      timeout: 0,
    })
    try {
      await requestDeletion.mutateAsync(deletionReason || undefined)
      toast.add({
        id: toastId,
        title: "Request submitted",
        description: "We'll review your request and contact you.",
        type: "success",
        timeout: 5000,
      })
      setDeletionReason("")
    } catch (err) {
      toast.add({
        id: toastId,
        title: "Request failed",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  async function handleCancelDeletion() {
    const toastId = "cancel-deletion"
    toast.add({
      id: toastId,
      title: "Cancelling request...",
      type: "loading",
      timeout: 0,
    })
    try {
      await cancelDeletion.mutateAsync()
      toast.add({
        id: toastId,
        title: "Request cancelled",
        type: "success",
        timeout: 4000,
      })
    } catch (err) {
      toast.add({
        id: toastId,
        title: "Couldn't cancel",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
        timeout: 5000,
      })
    }
  }

  return (
    <Tabs defaultValue="profile" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="data">Your data</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <div className="flex flex-col gap-6">
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
                {settings.avatarUrl && (
                  <AvatarImage src={settings.avatarUrl} alt={fullName} />
                )}
                <AvatarFallback className="bg-pink/15 text-base font-semibold text-pink">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-1 flex-col gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-fit rounded-md text-xs"
                  disabled={uploadAvatar.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} />
                  {uploadAvatar.isPending ? "Uploading…" : "Change photo"}
                </Button>
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
                  {settings.email}
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

          <div className="flex items-center justify-end gap-3">
            {savedAt && !updateProfile.isPending && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            <Button
              size="sm"
              className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
              disabled={!canSaveProfile}
              onClick={handleSaveProfile}
            >
              {updateProfile.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="notifications" className="mt-0">
        <div className="flex flex-col gap-6">
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
                    checked={!!prefs[key]}
                    onCheckedChange={() => togglePref(key)}
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            {savedAt && !updateProfile.isPending && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            <Button
              size="sm"
              className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
              disabled={updateProfile.isPending}
              onClick={handleSaveProfile}
            >
              {updateProfile.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="security" className="mt-0">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <KeyRound
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Password
                </h2>
                <p className="text-xs text-muted-foreground">
                  {settings.login.hasPassword
                    ? "Change the password you use to sign in."
                    : "You signed in with a provider. No password is set."}
                </p>
              </div>
            </div>

            {settings.login.hasPassword && (
              <div className="flex flex-col rounded-xl bg-card p-5 shadow">
                <Field label="Current password">
                  <div className="relative">
                    <Input
                      className={`${fieldStyles} pr-10`}
                      type={revealPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setRevealPasswords((v) => !v)}
                      aria-label={
                        revealPasswords ? "Hide passwords" : "Show passwords"
                      }
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {revealPasswords ? (
                        <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                </Field>

                <Field
                  label="New password"
                  hint="At least 8 characters"
                  error={
                    newPasswordTooShort
                      ? "Must be at least 8 characters"
                      : sameAsCurrent
                        ? "New password must differ from your current one"
                        : undefined
                  }
                >
                  <div className="relative">
                    <Input
                      className={`${fieldStyles} pr-10`}
                      type={revealPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setRevealPasswords((v) => !v)}
                      aria-label={
                        revealPasswords ? "Hide passwords" : "Show passwords"
                      }
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {revealPasswords ? (
                        <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                </Field>

                <Field
                  label="Confirm new password"
                  error={
                    passwordsMismatch ? "Passwords don't match" : undefined
                  }
                >
                  <div className="relative">
                    <Input
                      className={`${fieldStyles} pr-10`}
                      type={revealPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setRevealPasswords((v) => !v)}
                      aria-label={
                        revealPasswords ? "Hide passwords" : "Show passwords"
                      }
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {revealPasswords ? (
                        <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                </Field>

                {passwordsMismatch && (
                  <p className="mb-2 text-[11px] font-medium text-destructive">
                    Passwords do not match
                  </p>
                )}
                {passwordsMatch && (
                  <p className="mb-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-500">
                    Passwords match
                  </p>
                )}
                {needsMfa && (
                  <p className="mb-2 text-[11px] font-medium text-orange">
                    Enter a code from your authenticator app to continue.
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
                    disabled={!canChangePassword}
                    onClick={handleChangePassword}
                  >
                    {changePassword.isPending ? "Updating…" : "Change password"}
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <ShieldCheck
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Two-factor authentication
                </h2>
                <p className="text-xs text-muted-foreground">
                  {settings.mfaRequired
                    ? "Authenticator code required for this account."
                    : "Add an extra layer of security to your account."}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-5 shadow sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  Authenticator app
                </span>
                <span className="text-xs text-muted-foreground">
                  {settings.mfaRequired
                    ? "Enabled"
                    : "Require a 6-digit code from your authenticator app at sign-in."}
                </span>
              </div>
              <Link
                className="flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-xs font-medium text-background"
                href="/settings/security"
              >
                Manage
                <ArrowRight className="ml-1 h-3 w-3" strokeWidth={1.75} />
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <Laptop
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Devices
                </h2>
                <p className="text-xs text-muted-foreground">
                  Devices currently signed in to your account.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-card p-5 shadow">
              {settings.sessions.length > 0 ? (
                <div className="flex flex-col divide-y divide-border/60">
                  {settings.sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {describeUserAgent(s.userAgent)}
                          </span>
                          {s.isCurrent && (
                            <span className="rounded bg-blue-light px-1.5 py-0.5 text-[10px] font-medium text-blue">
                              This device
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Last active {formatDate(s.lastActive)}
                          {s.aal === "aal2" && " · 2FA"}
                        </p>
                      </div>
                      {!s.isCurrent && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0 rounded-md text-xs"
                          disabled={revokeSession.isPending}
                          onClick={() => handleRevokeSession(s.id)}
                        >
                          Sign out
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No active sessions.
                </p>
              )}

              {settings.sessions.length > 1 && (
                <div className="mt-3 flex justify-end border-t border-border/60 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-md text-xs"
                    disabled={revokeOthers.isPending}
                    onClick={handleRevokeOthers}
                  >
                    Sign out all other devices
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </TabsContent>

      <TabsContent value="data" className="mt-0">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <Download
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Export your data
                </h2>
                <p className="text-xs text-muted-foreground">
                  Download a copy of everything we hold about you (POPIA).
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-5 shadow sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  My data (JSON)
                </span>
                <span className="text-xs text-muted-foreground">
                  Includes your profile, children, enrolments, and consents.
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-9 shrink-0 rounded-md text-xs"
                disabled={exportData.isPending}
                onClick={handleExport}
              >
                {exportData.isPending ? "Preparing…" : "Download"}
              </Button>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <Trash2
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive"
                strokeWidth={1.75}
              />
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Delete account
                </h2>
                <p className="text-xs text-muted-foreground">
                  Request permanent deletion of your account and data.
                </p>
              </div>
            </div>

            {openDeletionRequest ? (
              <div className="flex flex-col items-start gap-3 rounded-xl border border-orange/40 bg-orange/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    Deletion request pending
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Submitted {formatDate(openDeletionRequest.createdAt)}. Our
                    team will review it.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 shrink-0 rounded-md text-xs"
                  disabled={cancelDeletion.isPending}
                  onClick={handleCancelDeletion}
                >
                  {cancelDeletion.isPending ? "Cancelling…" : "Cancel request"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow">
                {settings.deletionBlockers.length > 0 ? (
                  <div className="flex flex-col gap-1.5 rounded-lg bg-muted/40 p-3">
                    <span className="text-xs font-medium text-foreground">
                      You can&apos;t delete your account yet:
                    </span>
                    <ul className="flex flex-col gap-1">
                      {settings.deletionBlockers.map((b, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                        >
                          <X className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    <Field label="Reason (optional)">
                      <Input
                        className={fieldStyles}
                        value={deletionReason}
                        onChange={(e) => setDeletionReason(e.target.value)}
                        placeholder="Tell us why you're leaving (optional)"
                      />
                    </Field>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 rounded-md border-destructive/40 text-xs font-medium text-destructive"
                        disabled={requestDeletion.isPending}
                        onClick={handleRequestDeletion}
                      >
                        {requestDeletion.isPending
                          ? "Submitting…"
                          : "Request deletion"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {settings.requests.filter((r) => r.status === "done").length >
              0 && (
              <div className="rounded-xl bg-card p-5 shadow">
                <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  Past requests
                </span>
                <div className="mt-2 flex flex-col divide-y divide-border/60">
                  {settings.requests
                    .filter((r) => r.status !== "open")
                    .map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                      >
                        <span className="text-xs text-foreground capitalize">
                          {r.kind} · {r.status}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-2 text-xs text-muted-foreground">
            {settings.contact.email && (
              <p>
                Questions? Email{" "}
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="text-information underline underline-offset-2 hover:text-information/70"
                >
                  {settings.contact.email}
                </a>
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {settings.policy.privacyUrl && (
                <Link
                  href={settings.policy.privacyUrl}
                  className="text-information underline underline-offset-2 hover:text-information/70"
                >
                  Privacy policy
                </Link>
              )}
              {settings.policy.termsUrl && (
                <Link
                  href={settings.policy.termsUrl}
                  className="text-information underline underline-offset-2 hover:text-information/70"
                >
                  Terms of service
                </Link>
              )}
            </div>
          </section>
        </div>
      </TabsContent>
    </Tabs>
  )
}
