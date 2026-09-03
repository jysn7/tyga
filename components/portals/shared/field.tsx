import { cn } from "@/lib/utils"

const fieldStyles =
  "h-auto border-none bg-input px-0 rounded-lg shadow-none text-[15px] text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50"

export function Field({
  label,
  children,
  className,
  hint,
}: {
  label: string
  children: React.ReactNode
  className?: string
  hint?: string
}) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 py-3 last:border-b-0", className)}
    >
      <span className="border-borderfont-medium border-b text-xs tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <div className={fieldStyles}>{children}</div>
      {hint && (
        <span className="pt-0.5 text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  )
}
