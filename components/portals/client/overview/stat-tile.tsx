import type { LucideIcon } from "lucide-react"

type StatColor =
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "purple"
  | "teal"
  | "orange"
  | "pink"
  | "gray"

const colorMap: Record<
  StatColor,
  { bg: string; chip: string; icon: string; value: string; label: string }
> = {
  blue: {
    bg: "bg-blue-light",
    chip: "bg-blue/15",
    icon: "text-blue",
    value: "text-foreground",
    label: "text-muted-foreground",
  },
  green: {
    bg: "bg-green-light",
    chip: "bg-foreground/5 dark:bg-foreground/25",
    icon: "text-card ",
    value: "text-foreground",
    label: "text-muted-foreground dark:text-background",
  },
  yellow: {
    bg: "bg-yellow-light",
    chip: "bg-card/25 dark:bg-foreground/25",
    icon: "text-yellow",
    value: "text-foreground",
    label: "text-muted-foreground",
  },
  red: {
    bg: "bg-red-light",
    chip: "bg-card/25 dark:bg-foreground/25",
    icon: "text-red",
    value: "text-foreground",
    label: "text-muted-foreground",
  },
  purple: {
    bg: "bg-purple-light",
    chip: "bg-card/25 dark:bg-foreground/25",
    icon: "text-purple",
    value: "text-foreground",
    label: "text-muted-foreground",
  },
  teal: {
    bg: "bg-teal/80",
    chip: "bg-card/25 dark:bg-foreground/25",
    icon: "text-secondary",
    value: "text-foreground",
    label: "text-secondary",
  },
  orange: {
    bg: "bg-orange-light",
    chip: "bg-foreground/10 dark:bg-foreground/25",
    icon: "text-secondary",
    value: "text-foreground",
    label: "dark:text-secondary text-foreground",
  },
  pink: {
    bg: "bg-pink-light",
    chip: "bg-pink/15",
    icon: "text-pink",
    value: "text-foreground",
    label: "text-muted-foreground",
  },
  gray: {
    bg: "bg-foreground/80 dark:bg-foreground",
    chip: "bg-background/15",
    icon: "text-background",
    value: "text-background",
    label: "text-background/70",
  },
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  color = "blue",
  compact = false,
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  color?: StatColor
  compact?: boolean
}) {
  const c = colorMap[color]

  return (
    <div
      className={`flex h-full flex-col justify-between rounded-xl shadow ${c.bg} ${
        compact
          ? "flex-row items-center justify-start gap-2 p-2.5 sm:gap-3 sm:p-4"
          : "gap-3 p-4"
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-lg ${c.chip} ${
          compact ? "h-10 w-10 sm:h-12 sm:w-12" : "h-8 w-8"
        }`}
      >
        <Icon
          className={`${c.icon} ${
            compact ? "h-3 w-3 sm:h-4 sm:w-4" : "h-4 w-4"
          }`}
          strokeWidth={1.75}
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <span
          className={`font-semibold tracking-tight tabular-nums ${
            compact ? "text-base sm:text-2xl" : "text-2xl"
          } ${c.value}`}
        >
          {value}
        </span>
        <span
          className={`leading-tight ${
            compact ? "text-[10px] sm:text-xs" : "text-xs"
          } ${c.label}`}
        >
          {label}
        </span>
        {hint && (
          <span className={`text-[11px] ${c.label} opacity-80`}>{hint}</span>
        )}
      </div>
    </div>
  )
}
