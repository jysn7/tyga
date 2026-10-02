import { PageHeader } from "@/components/portals/shared/page-header"
import { AppointmentsPage } from "@/components/portals/admin/appointments/appointments-page"

export default function AdminAppointmentsRoute() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Appointments"
        description="Every assessment and consultation across the academy"
      />
      <AppointmentsPage />
    </div>
  )
}
