import { AppointmentsView } from "@/components/portals/Coach/appointments/appointments-view"

// Pages stay tiny: a title plus the view component that does the real work.
export default function CoachAppointmentsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Claim intake assessments and record parent consultations.
        </p>
      </div>
      <AppointmentsView />
    </div>
  )
}
