export function Field({
  label,
  children,
  hint,
  error,
  required,
}: {
  label: string
  children: React.ReactNode
  hint?: string
  error?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border/60 py-4 last:border-b-0">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {children}
      {error ? (
        <span className="pt-0.5 text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="pt-0.5 text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  )
}

export const fieldStyles =
  "border-none bg-secondary pl-2 shadow-none text-[15px] text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50"

export const triggerStyles =
  "h-auto w-full justify-start border-none bg-transparent pl-2 text-[15px] font-normal text-foreground shadow-none hover:bg-transparent"
