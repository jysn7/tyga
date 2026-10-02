"use client"

import { useState, type FormEvent } from "react"
import { SimpleModal } from "@/components/portals/shared/simple-modal"
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/portals/shared/form-styles"
import { useLevels } from "@/hooks/lookups/use-lookups"
import type { CoachAppointmentItem } from "@/hooks/coach/use-appointments"
import {
  useRecordAssessment,
  useRecordConsultation,
} from "@/hooks/coach/use-appointments-mutations"

type RecordOutcomeModalProps = {
  appointment: CoachAppointmentItem | null // null = modal closed
  onClose: () => void
}

export function RecordOutcomeModal({ appointment, onClose }: RecordOutcomeModalProps) {
  if (!appointment) return null

  return (
    <SimpleModal
      open
      title={
        appointment.type === "assessment" ? "Record assessment" : "Record consultation"
      }
      onClose={onClose}
    >
      {/* The form is a separate component that only exists while the modal
          is open, so its fields start empty every time. */}
      <OutcomeForm appointment={appointment} onClose={onClose} />
    </SimpleModal>
  )
}

function OutcomeForm({
  appointment,
  onClose,
}: {
  appointment: CoachAppointmentItem
  onClose: () => void
}) {
  const isAssessment = appointment.type === "assessment"
  const [levelId, setLevelId] = useState("")
  const [notes, setNotes] = useState("")

  const { data: levels } = useLevels()
  const recordAssessment = useRecordAssessment()
  const recordConsultation = useRecordConsultation()
  const mutation = isAssessment ? recordAssessment : recordConsultation

  function handleSubmit(e: FormEvent) {
    e.preventDefault() // stop the browser reloading the page
    const cleanNotes = notes.trim() || null

    if (isAssessment) {
      recordAssessment.mutate(
        {
          appointmentId: appointment.id,
          assessedLevelId: Number(levelId),
          notes: cleanNotes,
        },
        { onSuccess: onClose }
      )
    } else {
      recordConsultation.mutate(
        { appointmentId: appointment.id, notes: cleanNotes },
        { onSuccess: onClose }
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">{appointment.memberName}</p>

      {isAssessment && (
        <div>
          <label htmlFor="assessed-level" className={labelClass}>
            Assessed level
          </label>
          <select
            id="assessed-level"
            className={inputClass}
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            required
          >
            <option value="">Choose a level</option>
            {levels?.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            This sets the child&apos;s level automatically.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="outcome-notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="outcome-notes"
          className={inputClass}
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {mutation.error && (
        <p className="text-sm text-red-600">{mutation.error.message}</p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" className={secondaryButtonClass} onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className={primaryButtonClass}
          disabled={mutation.isPending || (isAssessment && !levelId)}
        >
          {mutation.isPending ? "Saving..." : "Save and complete"}
        </button>
      </div>
    </form>
  )
}
