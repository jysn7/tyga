import { cn } from "@/lib/utils"

export const fieldStyles = cn(
  "h-10 w-full rounded-lg border border-border bg-input px-3",
  "text-[15px] text-foreground",
  "placeholder:text-muted-foreground",
  "focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

export function Field({
  label,
  children,
  className,
  hint,
  action,
  error,
}: {
  label: string
  children: React.ReactNode
  className?: string
  hint?: string
  action?: React.ReactNode
  error?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 py-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {action}
      </div>
      {children}
      {hint && !error && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
