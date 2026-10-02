import { PageHeader } from "@/components/portals/shared/page-header"
import { AdminSettingsForm } from "@/components/portals/admin/settings/settings-form"

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure how the academy behaves and what users see"
      />
      <AdminSettingsForm />
    </div>
  )
}
