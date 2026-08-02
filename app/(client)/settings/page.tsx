import { PageHeader } from "@/components/portals/shared/page-header"
import { SettingsForm } from "@/components/portals/client/settings/settings-form"
import { sampleAccount } from "@/components/portals/client/settings/settings-sample-data"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Your account details and preferences"
      />
      <SettingsForm account={sampleAccount} />
    </div>
  )
}
