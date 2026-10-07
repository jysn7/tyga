import { AlertCircle } from "lucide-react"

export function SessionLockBanner({
  readOnly,
  isCancelled,
}: {
  readOnly: boolean
  isCancelled: boolean
}) {
  if (!readOnly) return null

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
      <AlertCircle
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
      />
      <p className="text-xs text-muted-foreground">
        {isCancelled
          ? "This session was cancelled. Nothing to record."
          : "Attendance, curriculum, and notes unlock when the session begins."}
      </p>
    </div>
  )
}
