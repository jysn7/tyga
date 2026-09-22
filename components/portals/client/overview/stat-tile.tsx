import type { LucideIcon } from "lucide-react"

export function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-foreground/80 p-4 text-card shadow dark:bg-foreground">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tracking-tight text-card">
          {value}
        </span>
        <span className="text-xs text-card">{label}</span>
      </div>
    </div>
  )
}
