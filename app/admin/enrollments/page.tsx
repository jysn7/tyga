import { PageHeader } from "@/components/portals/shared/page-header"
import { AdminEnrollmentsPage } from "@/components/portals/admin/enrollments/admin-enrollments-page"

export default function Page() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Enrolments"
        description="View and manage every enrolment across the academy"
      />
      <AdminEnrollmentsPage />
    </div>
  )
}
