import { Suspense } from "react"
import { PageHeader } from "@/components/portals/shared/page-header"
import { AdminFinancePage } from "@/components/portals/admin/finance/admin-finance-page"
import { Loader } from "@/components/portals/shared/loader"

/**
 * Finance landing page for academy admins.
 * Renders the shared page shell and lazy-loads the finance dashboard content.
 */
export default function Page() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Finances"
        description="View and manage every finance-related activity across the academy"
      />
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center rounded-xl bg-card shadow">
            <Loader />
          </div>
        }
      >
        <AdminFinancePage />
      </Suspense>
    </div>
  )
}
