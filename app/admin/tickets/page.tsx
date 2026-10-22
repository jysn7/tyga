"use client"

import { PageHeader } from "@/components/portals/shared/page-header"
import { AdminSupportPage } from "@/components/portals/admin/support/admin-support-page"

export default function Page() {
  return (
    <div className="max-w-8xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Support tickets"
        description="Manage support tickets and direct messages"
      />
      <AdminSupportPage />
    </div>
  )
}
