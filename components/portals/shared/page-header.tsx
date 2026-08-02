import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  meta,
  className,
}: {
  title: string
  description?: string
  icon?: React.ElementType
  action?: React.ReactNode
  meta?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 border-b border-border/70 pb-8 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon
              className="h-4.5 w-4.5 text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {meta && (
            <div className="flex items-center gap-1.5 pt-0.5">{meta}</div>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
