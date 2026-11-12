"use client"
import { useState } from "react"
import { useSaveSessionNotes } from "@/hooks/coach/use-coach-mutations"

export function SessionNotesTab({
  sessionId,
  initialNotes,
}: {
  sessionId: number
  initialNotes: string
}) {
  const [notes, setNotes] = useState(initialNotes || "")
  const saveNotes = useSaveSessionNotes()

  const handleSave = async () => {
    try {
      await saveNotes.mutateAsync({ sessionId, notes })
      alert("Notes saved successfully!")
    } catch (error) {
      console.error("Failed to save notes", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Session Notes</h3>
        <button
          onClick={handleSave}
          disabled={saveNotes.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          {saveNotes.isPending ? "Saving..." : "Save Notes"}
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
