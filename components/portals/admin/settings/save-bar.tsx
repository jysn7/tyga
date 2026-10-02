"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SaveBar({
  onSave,
  isSaving,
  savedAt,
}: {
  onSave: () => void
  isSaving: boolean
  savedAt: number | null
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      {savedAt && !isSaving && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3 w-3 text-green" strokeWidth={2} />
          Saved
        </span>
      )}
      <Button
        size="sm"
        className="h-9 rounded-md bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90"
        disabled={isSaving}
        onClick={onSave}
      >
        {isSaving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  )
}
