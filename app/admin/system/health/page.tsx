"use client"

import { PageHeader } from "@/components/portals/shared/page-header"
import { SystemHealthPage } from "@/components/portals/admin/health/system-health-page"

export default function Page() {
  return (
    <div className="max-w-8xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="System health"
        description="Database integrity, scheduled jobs, and data exports"
      />
      <SystemHealthPage />
    </div>
  )
}
