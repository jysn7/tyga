"use client"
import { useState } from "react"
import { useSessionMutations } from "@/hooks/use-sessions-mutations"

export function SessionNotesTab({
  sessionId,
  initialNotes,
}: {
  sessionId: number
  initialNotes: string
}) {
  const [notes, setNotes] = useState(initialNotes || "")
  const { saveNotes } = useSessionMutations()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveNotes(sessionId, notes)
      alert("Notes saved successfully!")
    } catch (error) {
      console.error("Failed to save notes", error)
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Session Notes</h3>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          {isSaving ? "Saving..." : "Save Notes"}
        </button>
      </div>

      <textarea
        className="min-h-40 w-full rounded-md border p-3 text-sm"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter your observations or private coach notes here..."
      />
    </div>
  )
}
