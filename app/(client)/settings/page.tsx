import { PageHeader } from "@/components/portals/shared/page-header"
import { NewSettingsForm } from "@/components/portals/client/settings/new-settings-form"

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Your account details and preferences"
      />
      <NewSettingsForm />
    </div>
  )
}
