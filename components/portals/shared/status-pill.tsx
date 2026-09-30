import { cn } from "@/lib/utils"

export type StatusVariant =
  "success" | "warning" | "danger" | "neutral" | "info" | "teal" | "purple"

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-green-light text-secondary",
  warning: "bg-orange-light text-secondary",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-input text-muted-foreground",
  info: "bg-blue-light text-secondary",
  teal: "bg-teal-light text-secondary",
  purple: "bg-purple-light text-secondary",
}

export function StatusPill({
  label,
  variant = "neutral",
  className,
}: {
  label: string
  variant?: StatusVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
