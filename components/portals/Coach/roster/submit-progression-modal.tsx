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
import { useCurriculumModules } from "@/hooks/coach/use-progression"
import { useSubmitProgression } from "@/hooks/coach/use-progression-mutations"
import type { RosterEntry } from "@/hooks/coach/use-roster"

type SubmitProgressionModalProps = {
  member: RosterEntry | null // null = modal closed
  onClose: () => void
}

export function SubmitProgressionModal({ member, onClose }: SubmitProgressionModalProps) {
  if (!member) return null

  return (
    <SimpleModal open title={`Progression: ${member.memberName}`} onClose={onClose}>
      <ProgressionForm member={member} onClose={onClose} />
    </SimpleModal>
  )
}

function ProgressionForm({
  member,
  onClose,
}: {
  member: RosterEntry
  onClose: () => void
}) {
  // Start with the level just above the current one selected
  const [toLevelId, setToLevelId] = useState(
    member.nextLevelId ? String(member.nextLevelId) : ""
  )
  const [badgeComplete, setBadgeComplete] = useState(false)
  const [notes, setNotes] = useState("")

  const { data: levels } = useLevels()
  const { data: modules } = useCurriculumModules(member.currentLevelId)
  const submit = useSubmitProgression()

  const milestones = (modules ?? []).filter((m) => m.isMilestone)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit.mutate(
      {
        memberId: member.memberId,
        toLevelId: Number(toLevelId),
        badgeComplete,
        notes: notes.trim() || null,
      },
      { onSuccess: onClose }
    )
  }

  // Hooks must all run before an early return, so this check comes after them.
  if (member.currentLevelId === null) {
    return (
      <div className="space-y-4">
        <p className="text-sm">
          {member.memberName} has no level yet. Complete their intake assessment
          first, then come back to submit a progression.
        </p>
        <div className="flex justify-end">
          <button type="button" className={secondaryButtonClass} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Current level: <span className="text-foreground">{member.currentLevelName}</span>
      </p>

      {milestones.length > 0 && (
        <div className="rounded-md bg-muted/50 p-3">
          <p className="mb-1 text-sm font-medium">
            Milestones to check for {member.currentLevelName}
          </p>
          <ul className="list-disc space-y-0.5 pl-5 text-sm">
            {milestones.map((m) => (
              <li key={m.id}>{m.name}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="to-level" className={labelClass}>
          Move to level
        </label>
        <select
          id="to-level"
          className={inputClass}
          value={toLevelId}
          onChange={(e) => setToLevelId(e.target.value)}
          required
        >
          <option value="">Choose a level</option>
          {levels
            ?.filter((l) => l.id !== member.currentLevelId)
            .map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
        </select>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={badgeComplete}
          onChange={(e) => setBadgeComplete(e.target.checked)}
        />
        <span>
          Badge complete
          <span className="block text-xs text-muted-foreground">
            Tick this only when the child has met the criteria. It sends the
            family a &quot;Level up&quot; notification.
          </span>
        </span>
      </label>

      <div>
        <label htmlFor="progression-notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="progression-notes"
          className={inputClass}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {submit.error && <p className="text-sm text-red-600">{submit.error.message}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" className={secondaryButtonClass} onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className={primaryButtonClass}
          disabled={submit.isPending || !toLevelId}
        >
          {submit.isPending ? "Submitting..." : "Submit progression"}
        </button>
      </div>
    </form>
  )
}
