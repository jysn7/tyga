import { cookies } from "next/headers"
import { PageHeader } from "@/components/portals/shared/page-header"
import { SettingsForm } from "@/components/portals/client/settings/settings-form"
import { createClient } from "@/utils/supabase/server"

type AccountRow = {
  id: string
  role: string
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  active: boolean
  created_at: string
}

type NotificationPreferenceRow = {
  notification_type: string
  enabled: boolean
}

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [accountResult, prefsResult] = await Promise.all([
    supabase.rpc("get_my_account").single<AccountRow>(),
    supabase.rpc("get_my_notification_preferences"),
  ])

  const { data: account, error: accountError } = accountResult
  const { data: prefsRows, error: prefsError } = prefsResult as {
    data: NotificationPreferenceRow[] | null
    error: { message: string } | null
  }

  if (accountError || !account) {
    throw new Error(accountError?.message ?? "Could not load account")
  }
  if (prefsError) {
    throw new Error(prefsError.message)
  }

  const preferences = Object.fromEntries(
    (prefsRows ?? []).map((row) => [row.notification_type, row.enabled])
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Your account details and preferences"
      />
      <SettingsForm
        account={{
          id: account.id,
          fullName: account.full_name ?? "",
          email: account.email ?? "",
          phone: account.phone ?? "",
          address: account.address ?? "",
          preferences,
        }}
      />
    </div>
  )
}
