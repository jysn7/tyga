import { createClient } from "@/utils/supabase/client"

export async function saveAccountSettings({
  fullName,
  phone,
  address,
  changedPrefs, // only the prefs that actually changed: { [notificationType]: enabled }
}: {
  fullName: string
  phone: string
  address: string
  changedPrefs: Record<string, boolean>
}) {
  const supabase = createClient()

  const { error: accountError } = await supabase.rpc("update_my_account", {
    p_full_name: fullName,
    p_phone: phone,
    p_address: address,
  })
  if (accountError) throw accountError

  const entries = Object.entries(changedPrefs)
  if (entries.length > 0) {
    const results = await Promise.all(
      entries.map(([notificationType, enabled]) =>
        supabase.rpc("set_notification_preference", {
          p_notification_type: notificationType,
          p_enabled: enabled,
        })
      )
    )
    const prefError = results.find((r) => r.error)?.error
    if (prefError) throw prefError
  }
}
