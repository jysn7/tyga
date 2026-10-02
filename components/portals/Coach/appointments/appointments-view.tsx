"use client"

import { useState } from "react"
import {
  useCoachAppointmentList,
  type CoachAppointmentItem,
  type CoachAppointmentKind,
} from "@/hooks/coach/use-appointments"
import { useClaimAssessment } from "@/hooks/coach/use-appointments-mutations"
import { AppointmentCard } from "./appointment-card"
import { RecordOutcomeModal } from "./record-outcome-modal"

const TABS: { kind: CoachAppointmentKind; label: string }[] = [
  { kind: "assessment", label: "Intake assessments" },
  { kind: "parent_consultation", label: "Parent consultations" },
]

export function AppointmentsView() {
  const [tab, setTab] = useState<CoachAppointmentKind>("assessment")
  const [selected, setSelected] = useState<CoachAppointmentItem | null>(null)

  const { data, isLoading, error } = useCoachAppointmentList(tab)
  const claim = useClaimAssessment()

  const items = data ?? []
  const open = items.filter(
    (a) => a.status === "requested" || a.status === "scheduled"
  )
  const past = items.filter((a) => !open.includes(a))

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {TABS.map((t) => (
          <button
            key={t.kind}
            type="button"
            onClick={() => setTab(t.kind)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t.kind
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {claim.error && <p className="text-sm text-red-600">{claim.error.message}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error.message}</p>}

      {!isLoading && !error && items.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {tab === "assessment"
            ? "No assessments yet. New requests from parents will appear here for you to claim."
            : "No parent consultations are assigned to you yet."}
        </div>
      )}

      {open.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">To do</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {open.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                isClaiming={claim.isPending && claim.variables === a.id}
                onClaim={(id) => claim.mutate(id)}
                onRecord={setSelected}
              />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">History</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {past.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                isClaiming={false}
                onClaim={() => {}}
                onRecord={setSelected}
              />
            ))}
          </div>
        </section>
      )}

      <RecordOutcomeModal appointment={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
