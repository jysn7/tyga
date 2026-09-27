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

const colorMap: Record<StatColor, { bg: string; chip: string; icon: string }> =
  {
    blue: {
      bg: "bg-blue-light",
      chip: "bg-blue/50",
      icon: "text-blue-light",
    },
    green: {
      bg: "bg-primary/70",
      chip: "bg-primary/50",
      icon: "text-prmary/80",
    },
    yellow: {
      bg: "bg-yellow-light",
      chip: "bg-yellow/50",
      icon: "text-yellow-light",
    },
    red: {
      bg: "bg-red-light",
      chip: "bg-red/50",
      icon: "text-red-light",
    },
    purple: {
      bg: "bg-purple-light",
      chip: "bg-purple/50",
      icon: "text-purple-light",
    },
    teal: {
      bg: "bg-teal-light",
      chip: "bg-teal/50",
      icon: "text-teal-light",
    },
    orange: {
      bg: "bg-orange",
      chip: "bg-secondary",
      icon: "text-orange-light",
    },
    pink: {
      bg: "bg-pink-light",
      chip: "bg-pink/50",
      icon: "text-pink-light",
    },
    gray: {
      bg: "bg-foreground/80 dark:bg-foreground",
      chip: "bg-secondary",
      icon: "text-foreground",
    },
  }

export function StatTile({
  label,
  value,
  icon: Icon,
  color = "blue",
  compact = false,
}: {
  label: string
  value: string
  icon: LucideIcon
  color?: StatColor
  compact?: boolean
}) {
  const c = colorMap[color]

  return (
    <div
      className={`flex h-full flex-col justify-between rounded-xl shadow ${c.bg} ${
        compact ? "gap-2 p-3 sm:gap-3 sm:p-4" : "gap-3 p-4"
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-lg ${c.chip} ${
          compact ? "h-7 w-7 sm:h-9 sm:w-9" : "h-9 w-9"
        }`}
      >
        <Icon
          className={`${c.icon} ${
            compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4"
          }`}
          strokeWidth={1.75}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className={`font-semibold tracking-tight ${
            compact ? "text-lg sm:text-2xl" : "text-2xl"
          } ${color === "gray" ? "text-secondary" : "text-foreground"}`}
        >
          {value}
        </span>
        <span
          className={`${compact ? "text-[11px] sm:text-xs" : "text-xs"} ${
            color === "gray" ? "text-secondary/70" : "text-foreground"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
