"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
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

export type AccountSettings = {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  preferences: Record<string, boolean>
}

export function SettingsForm({ account }: { account: AccountSettings }) {
  const router = useRouter()
  const [fullName, setFullName] = useState(account.fullName)
  const [phone, setPhone] = useState(account.phone)
  const [address, setAddress] = useState(account.address)
  const [prefs, setPrefs] = useState(account.preferences)
  const [changedPrefKeys, setChangedPrefKeys] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  function togglePref(key: string) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    setChangedPrefKeys((prev) => new Set(prev).add(key))
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
    <div className="flex flex-col gap-10">
      <section className="rounded-xl bg-secondary p-4 shadow">
        <h2 className="pb-1 text-sm font-medium text-foreground">Profile</h2>
        <div className="flex flex-col">
          <Field label="Full name">
            <Input
              className={fieldStyles}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
          <Field label="Email" hint="Contact TYGA to change your login email">
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
      </section>

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
      </section>

      <div className="flex items-center justify-end gap-3">
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
    </div>
  )
}
