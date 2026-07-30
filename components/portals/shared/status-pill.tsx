import { CheckCircle2, Circle } from "lucide-react"

export type StatusVariant = "success" | "warning" | "danger" | "neutral"

interface StatusPillProps {
  label: string
  variant?: StatusVariant
}

export function StatusPill({ label, variant = "neutral" }: StatusPillProps) {
  return (
    <div className="flex items-center gap-2">
      {variant === "success" && (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      )}
      {variant === "warning" && (
        <Circle className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
      )}
      {variant === "danger" && (
        <Circle className="h-2.5 w-2.5 fill-red-500 text-red-500" />
      )}
      {variant === "neutral" && (
        <Circle className="h-2.5 w-2.5 fill-zinc-400 text-zinc-400" />
      )}
      <span
        className={`text-sm font-medium ${
          variant === "success"
            ? "text-emerald-600"
            : variant === "warning"
              ? "text-amber-600"
              : variant === "danger"
                ? "text-red-600"
                : "text-zinc-600"
        }`}
      >
        {label}
      </span>
    </div>
  )
}
